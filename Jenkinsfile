#!groovy
node {
  try {

    stage('Checkout') {
      echo 'Checkout...'
      checkout scm
      sh 'pwd'
    }
    stage('Build') {
      echo 'Building....'
      tool name: 'recent node', type: 'nodejs'
      sh '/var/jenkins_home/tools/jenkins.plugins.nodejs.tools.NodeJSInstallation/recent_node/node --version'
    }
    stage('Test') {
      echo 'Building....'
    }
    stage('Deploy') {
      echo 'Deploying....'
    }
  }
  catch (err) {
    echo 'Build failded: ${err}'
  }
}
