pipeline {
    agent any

    environment {
        // This ensures Jenkins uses the node/docker tools installed on it
        PATH = "/usr/local/bin:$PATH"
    }

    stages {
        stage('Checkout') {
            steps {
                // Get the latest code from GitHub
                checkout scm
            }
        }

        stage('Build & Test Backend') {
            steps {
                dir('server') {
                    // Install dependencies and run a sanity check
                    sh 'npm install'
                    // We don't have real tests yet, so we just check if it parses
                    sh 'node -c index.js' 
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('client') {
                    sh 'npm install'
                    // Run the React build to ensure no syntax errors
                    sh 'npm run build'
                }
            }
        }
    }
}