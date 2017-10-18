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
    stage('Build') {
      echo 'Building....'
      echo 'RUN npm install'
      sh returnStdout: true, script: 'npm install'
      echo 'After npm install'
    }
    stage('Test') {
      echo 'Building....'
      sh 'npm build'
    }
    stage('Deploy') {
      echo 'Deploying....'
    }
  }
  catch (err) {
    echo 'Build failed: ${err}'
  }
}
