import { DynamoDbService } from './services/dynamodb';

import { Erro } from './models/erro';

import { ValidaToken, BuscaSegredoParameterStore } from 'escoladesoftware-autorizador-package-ts/lib';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy';
import { Usuario } from 'escoladesoftware-autorizador-package-ts/lib/models/usuario';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let erros: Erro[] = [];

    console.log(event);
    const token = event.requestContext.authorizer?.token || '';
    console.log(token);

    const secret = await new BuscaSegredoParameterStore()
        .BuscarSegredo(process.env.TokenSecretParameterName || '',
            false);

    let objetoToken: Usuario;
    try {
        objetoToken = new ValidaToken().ValidarToken(token, secret, {
            issuer: 'escoladesoftware',
            audience: 'escoladesoftware',
        }) as Usuario;
    }
    catch (e) {
        console.log(e);

        erros.push(new Erro('Token inválido, você não está autorizado a fazer isso'));
        return errorResult(403, erros);
    }

    try {
        const dynamoDb = new DynamoDbService();
        const usuario = await dynamoDb.ConsultaUsuario(objetoToken.email);

        return defaultResult(200, usuario);
    } catch (error) {
        console.log(error);
        throw error;
    }
};

function errorResult(statusCode: number, erros: Erro[]) {
    return defaultResult(statusCode, {
        erros: erros,
    });
}

function defaultResult(statusCode: number, object: object) {
    return {
        statusCode: statusCode,
        body: JSON.stringify(object),
        isBase64Encoded: false,
        headers: {
            'Content-Type': 'application/json',
        },
    };
}
