import { Construct } from 'constructs';
import { ApiConstructProps } from '../types/interfaces';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class ApiConstruct extends Construct {
  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);

    const api = new apigateway.RestApi(this, 'NuvinaryRestApi', {
      restApiName: 'NuvinaryRestApi',
      description: 'Nuvinary REST API',
      deployOptions: {
        stageName: props.stageName,
      },
    });

    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      'CognitoAuthorizer',
      {
        cognitoUserPools: [props.userPool],
      },
    );

    const paths = [...new Set(props.routes.map((r) => r.path))];

    paths.forEach((path) => {
      const resource = api.root.resourceForPath(path);
      const routeMethods = props.routes
        .filter((r) => r.path === path)
        .map((r) => r.fetchType);

      resource.addCorsPreflight({
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ['OPTIONS', ...routeMethods],
        allowHeaders: ['Content-Type', 'Authorization'],
      });

      props.routes
        .filter((r) => r.path === path)
        .forEach((route) => {
          resource.addMethod(
            route.fetchType,
            new apigateway.LambdaIntegration(route.fn),
            {
              authorizer,
              authorizationType: authorizer
                ? apigateway.AuthorizationType.COGNITO
                : apigateway.AuthorizationType.NONE,
            },
          );
        });
    });
  }
}
