module.exports = function (shipit) {
  require('shipit-deploy')(shipit)
  require('shipit-pm2')(shipit)
  require('shipit-yarn')(shipit)
  require('shipit-shared')(shipit)

  shipit.initConfig({
    default: {
      workspace: 'tmp',
      deployTo: '/var/www/depunaise-api',
      repositoryUrl: 'git@github.com:bingneef/DePunaise-Api.git',
      ignores: ['.git', 'node_modules', 'public/assets/post'],
      keepReleases: 10,
      shallowClone: true,
      dirToCopy: '',
      yarn: {
        remote: true,
      },
      shared: {
        overwrite: true,
        files: [
          'app.json',
          '.env',
        ],
        dirs: [
          'public/assets/post',
        ]
      }
    },
    production: {
      branch: 'master',
      servers: 'bing@5.157.85.46'
    },
  })
}


