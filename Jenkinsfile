#!groovy

node {

tool name: 'recent node', type: 'nodejs'
env.NODEJS_HOME = "${tool 'recent node'}"
env.PATH="${env.NODEJS_HOME}/bin:${env.PATH}"

  try {
    stage('init') {
     echo 'Init...'
     sh 'echo $PATH'
     sh 'node --version'
     sh 'npm --version'
     sh 'pwd'
    }
    stage('Checkout') {
      echo 'Checkout...'
      checkout scm
      sh 'ls -la'
    }
    stage('npm install') {
      echo 'npm install....'
      echo 'RUN npm install'
      sh 'rm -rf node_modules'
      sh 'ls -la'
      sh returnStdout: true, script: 'npm install'
      echo 'After npm install'
    }
    stage('Test') {
      echo 'CI=true npm test....'
      sh returnStdout: true, script: 'CI=true npm test'
    }
    stage('Building') {
      echo 'Building....'
      sh returnStdout: true, script: 'npm run build:css && npm run build:js'
    }
    stage('Deploy') {
      echo 'Deploying....'
    }
  }
  catch (err) {
    echo 'Build failed: ${err}'
  }
}
