const { awsHelperfunction } = require("../../../helpers/aws.helper");

exports.update = async function(req, res) {
    try{
        const {client} = req.app.locals
        const args = { // UpdateUserPoolClientRequest
            UserPoolId: process.env.UserPoolId, // required
            ClientId: process.env.ClientId, // required
            RefreshTokenValidity: Number("60"),
            AccessTokenValidity: Number("1"),
            IdTokenValidity: Number("1"),
            TokenValidityUnits: { // TokenValidityUnitsType
              AccessToken: "days",
              IdToken: "days",
              RefreshToken: "days",
            },
            ExplicitAuthFlows: [ // ExplicitAuthFlowsListType
              "ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH",
            ],
            // SupportedIdentityProviders: [ // SupportedIdentityProvidersListType
            //   "SignInWithApple","Facebook"
            // ],
            // CallbackURLs: [ // CallbackURLsListType
            //   "STRING_VALUE",
            // ],
            // LogoutURLs: [ // LogoutURLsListType
            //   "STRING_VALUE",
            // ],
            // DefaultRedirectURI: "STRING_VALUE",
            // AllowedOAuthFlows: [ // OAuthFlowsType
            //   "code" || "implicit" || "client_credentials",
            // ],
            // AllowedOAuthScopes: [ // ScopeListType
            //   "STRING_VALUE",
            // ],
            // AllowedOAuthFlowsUserPoolClient: true || false,
          };
          
          const data = await awsHelperfunction(
            args,
            client,
            "UpdateUserPoolClientCommand"
        )

        res.send({
            success:true,
            message: data
        })
    }catch(e){
        res.status(500).send({
            success: false,
            message: e.message
        })
    }
  }

exports.createIdentityProviders = async function (req,res) {
    const {client} = req.app.locals

    const args = { 
        UserPoolId: process.env.UserPoolId, // required
        ProviderName: "Google", // required
        ProviderType: "Google", // required
        ProviderDetails: { 
          "client_id": "STRING_VALUE",
          "client_secret": "123",
          "authorize_scopes": "123"
        },
        AttributeMapping: { // AttributeMappingType
            "email": "STRING_VALUE",
            "custom:fullname": "STRING_VALUE",
            "custom:gender": "STRING_VALUE",
            "custom:age": "STRING_VALUE",
            "custom:role": "STRING_VALUE",
        },
      };

      const data = await awsHelperfunction(
        args,
        client,
        "CreateIdentityProviderCommand"
    )

    res.send({
        success:true,
        message: "Created"
    })
}

exports.createAttributes = async function (req,res){
    const {client} = req.app.locals


    const args = {
        UserPoolId: process.env.UserPoolId,
        CustomAttributes: [
          {
            Name: "gender",
            AttributeDataType: "String",
            Mutable: true,
            Required: false
          },
          {
            Name: "age",
            AttributeDataType: "Number",
            Mutable: true,
            Required: false
          },
          {
            Name: "fullname",
            AttributeDataType: "String",
            Mutable: true,
            Required: false
          },
          {
            Name: "role",
            AttributeDataType: "String",
            Mutable: true,
            Required: false
          },
        ],
      };

      const data = await awsHelperfunction(
        args,
        client,
        "AddCustomAttributesCommand"
    )

    res.send({
        success:true,
        message: "Created"
    })
}

exports.createUserPool = async function (req,res) {
  const {client} = req.app.locals
  const args = { // CreateUserPoolRequest
    PoolName: "cubix-BOW-main", // required
    Policies: { // UserPoolPolicyType
      PasswordPolicy: { // PasswordPolicyType
        MinimumLength: Number("8"),
        RequireUppercase: true,
        RequireLowercase: true,
        RequireNumbers: true,
        RequireSymbols: true ,
        TemporaryPasswordValidityDays: Number("7"),
      },
    },
    AutoVerifiedAttributes: [ // VerifiedAttributesListType
       "email",
  ],
    UserAttributeUpdateSettings: { // UserAttributeUpdateSettingsType
      AttributesRequireVerificationBeforeUpdate: [ // AttributesRequireVerificationBeforeUpdateType
         "email",
      ],
    },
    MfaConfiguration: "OFF",
    Schema: [ // SchemaAttributesListType
    { // SchemaAttributeType
      Name: "email",
      AttributeDataType: "String",
      Required: true
    },
   ],
    EmailConfiguration: { // EmailConfigurationType
      EmailSendingAccount: "COGNITO_DEFAULT",

    },
    UsernameConfiguration: { // UsernameConfigurationType
      CaseSensitive: false // required
    }
  };

  const data = await awsHelperfunction(
    args,
    client,
    "CreateUserPoolCommand"
  )

  res.send({
      success:true,
      message: data
  })
}

exports.createUserPoolClient = async function (req,res) {
  const {client} = req.app.locals

  const args = { // CreateUserPoolClientRequest
    UserPoolId: "us-east-1_TC3viEwlC",// required
    ClientName: "cubix-boss-of-the-world", // required
    GenerateSecret: false,
    RefreshTokenValidity: Number("60"),
    AccessTokenValidity: Number("1"),
    IdTokenValidity: Number("1"),
    TokenValidityUnits: { // TokenValidityUnitsType
      AccessToken: "days",
      IdToken: "days",
      RefreshToken: "days",
    },
    // ReadAttributes: [ // ClientPermissionListType
    //   "STRING_VALUE",
    // ],
    // WriteAttributes: [
    //   "STRING_VALUE",
    // ],
    ExplicitAuthFlows: [ // ExplicitAuthFlowsListType
     "ALLOW_USER_PASSWORD_AUTH","ALLOW_REFRESH_TOKEN_AUTH",
    ]
  };


  const data = await awsHelperfunction(
    args,
    client,
    "CreateUserPoolClientCommand"
  )

  res.send({
      success:true,
      message: data
  })
}

exports.deleteUserPool = async function (req,res) {
  const {client} = req.app.locals

  const args = { // DeleteUserPoolRequest
    UserPoolId: process.env.UserPoolId, // required
  };

  const data = await awsHelperfunction(
    args,
    client,
    "DeleteUserPoolCommand"
  )

  res.send({
      success:true,
      message: data
  })
}