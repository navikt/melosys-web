#! groovy

node {
    tool name: 'recent node', type: 'nodejs'
    env.NODEJS_HOME = "${tool 'recent node'}"
    env.PATH="${env.NODEJS_HOME}/bin:${env.PATH}"
    echo("${env.PATH}")

    try {
        stage('Checkout') {
            echo('Checkout ...')
            checkout scm
        }

        stage('npm install ') {
            echo('npm install')
            // sh('rm -rf node_modules')
            // sh('ls -la')
            sh (returnStdout: true, script: 'npm install')
        }
        stage('Build') {
            echo('Build...')
            sh(returnStdout: true, script: 'npm run build')
        }
        stage('Test') {
            echo('CI=true npm test')
        }
        stage('Deploy') {
            echo('TODO Deploy')
        }
    }
    catch (err) {
        echo("Build failed! ${err}")
    }
}
