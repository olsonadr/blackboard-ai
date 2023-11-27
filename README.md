# Blackboard AI
**Blackboard AI** is an engineering work-surface empowered with neural-network handwritten-digit classification.

## Functionality
Currently, the site allows you to draw non-vertically-stacked numbers on the canvas, select any number with a bandbox, and use a tensorflow neural network to try to interpret your written digits, by pressing the "Predict" button.

## Usage

### Using Docker Compose
#### Requirements
- [Docker version supporting compose](https://docs.docker.com/desktop/install)

#### Steps
- Build/Install
  - `docker compose build`
- Run
  - `docker compose up -d`
  - ... (and then when you're done)
  - `docker compose down`

### Manual
#### Requirements
- Npm
- Pipenv
- Python 3.6 or [pyenv](https://github.com/pyenv/pyenv)

#### Steps
- Build/Install
  - `pipenv install && pipenv shell`
  - `npm install`
  - `npm run build`
- Run
  - `npm start`

## Todo
- Optimize canvas rendering
- Recognize mathematical operators
- Compute the results of prediction results
