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
     sh 'ls -la'
     echo 'RUN npm install'
     //sh returnStdout: true, script: 'npm install'

    }
    stage('Checkout') {
      echo 'Checkout...'
      //checkout scm
    }
    stage('Build') {
      echo 'Building....'
      //tool name: 'recent node', type: 'nodejs'
    }
    stage('Test') {
      echo 'Building....'
    }
    stage('Deploy') {
      echo 'Deploying....'
    }
  }
  catch (err) {
    echo 'Build failed: ${err}'
  }
}
