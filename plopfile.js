module.exports = function (plop) {
  plop.setGenerator('module', {
    description: 'Generate a complete 6-tier CRUD module',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Enter module name (e.g. product):',
        validate: function (value) {
          if (!value || value.trim() === '') {
            return 'Module name is required';
          }
          return true;
        },
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/modules/{{dashCase name}}/{{dashCase name}}.routes.ts',
        templateFile: 'plop-templates/routes.hbs',
      },
      {
        type: 'add',
        path: 'src/modules/{{dashCase name}}/{{dashCase name}}.controller.ts',
        templateFile: 'plop-templates/controller.hbs',
      },
      {
        type: 'add',
        path: 'src/modules/{{dashCase name}}/{{dashCase name}}.service.ts',
        templateFile: 'plop-templates/service.hbs',
      },
      {
        type: 'add',
        path: 'src/modules/{{dashCase name}}/{{dashCase name}}.repository.ts',
        templateFile: 'plop-templates/repository.hbs',
      },
      {
        type: 'add',
        path: 'src/modules/{{dashCase name}}/{{dashCase name}}.type.ts',
        templateFile: 'plop-templates/type.hbs',
      },
      {
        type: 'add',
        path: 'src/modules/{{dashCase name}}/{{dashCase name}}.validator.ts',
        templateFile: 'plop-templates/validator.hbs',
      },
    ],
  });
};
