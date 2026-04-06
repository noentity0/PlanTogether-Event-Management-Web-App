def runCommand(String command) {
  if (isUnix()) {
    sh command
  } else {
    bat command
  }
}

pipeline {
  agent any

  options {
    timestamps()
  }

  stages {
    stage('Install Backend Dependencies') {
      steps {
        dir('backend') {
          script {
            runCommand('npm ci')
          }
        }
      }
    }

    stage('Install Frontend Dependencies') {
      steps {
        dir('frontend') {
          script {
            runCommand('npm ci')
          }
        }
      }
    }

    stage('Backend Unit Tests') {
      steps {
        dir('backend') {
          script {
            runCommand('npm run test:unit')
          }
        }
      }
    }

    stage('Backend API Tests') {
      steps {
        dir('backend') {
          script {
            runCommand('npm run test:api')
          }
        }
      }
    }

    stage('Frontend Unit Tests') {
      steps {
        dir('frontend') {
          script {
            runCommand('npm run test:unit')
          }
        }
      }
    }
  }

  post {
    always {
      junit allowEmptyResults: true, testResults: 'backend/reports/junit/*.xml, frontend/reports/junit/*.xml'
      archiveArtifacts allowEmptyArchive: true, artifacts: 'backend/coverage/**, frontend/coverage/**'
    }
  }
}
