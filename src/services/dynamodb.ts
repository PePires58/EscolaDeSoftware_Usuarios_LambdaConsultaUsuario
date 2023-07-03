import {
    DynamoDBClient, GetItemCommand, GetItemCommandInput, GetItemCommandOutput
} from "@aws-sdk/client-dynamodb";

import { UsuarioEs } from '../models/usuario-es';

export class DynamoDbService {

    constructor() {
        this.client = new DynamoDBClient({ apiVersion: '2012-08-10' });
    }

    private client: DynamoDBClient;

    async ConsultaUsuario(token: string): Promise<UsuarioEs> {

        const input: GetItemCommandInput = {
            TableName: process.env.UsuariosTableName || '',
            ConsistentRead: false,
            Key: {
                "email": {
                    S: token
                }
            },
            AttributesToGet: [
                'email',
                'nome',
                'sobrenome'
            ]
        };

        const command: GetItemCommand = new GetItemCommand(input);

        return this.CriarObjetoUsuario(await this.client.send(command));
    }

    private CriarObjetoUsuario(output: GetItemCommandOutput): UsuarioEs {
        if (output.Item) {
            const usuarioItem = output.Item;

            const usuario: UsuarioEs = {
                email: usuarioItem.email.S || '',
                nome: usuarioItem.nome.S || '',
                sobrenome: usuarioItem.sobrenome.S || '',
                cpf: ''
            };

            return usuario;
        }
        return {
            email: '',
            nome: '',
            sobrenome: '',
            cpf: ''
        };
    }
}