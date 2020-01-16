# Visual Define-XML Editor

A cross-platform desktop application which allows to edit and review files created using Define-XML 2.0 and ARM 1.0 CDISC standards.

Visit [defineeditor.com](http://defineeditor.com) to learn more about the Editor.

# Installation

A compiled version of the application can be downloaded from the [site](http://defineeditor.com/downloads).

# Support

* [Github Issues](https://github.com/defineEditor/editor/issues)
* [Telegram](https://t.me/defineeditor)
* [support@defineeditor.com](support@defineeditor.com)

# Building the application from source

### Prerequisites

The following software is needed to compile the application:
* Git
* Node.js (v10+)
* Yarn

### Installing

Clone the repository:
```
git clone https://github.com/defineEditor/editor.git
```
Install all required dependencies:
```
yarn install
```

Compile the application using one of the following methods:
```
yarn package-win
yarn package-linux
yarn package-mac
```
or compile all of them using
```
yarn package-all
```
The compiled files will be stored in releases/Release-x.x.x

## Running in development mode

To run the application in a development mode use the following command:
```
yarn dev
```

## Authors

* [**Dmitry Kolosov**](https://www.linkedin.com/in/dmitry-kolosov-91751413/)
* [**Sergei Krivtcov**](https://www.linkedin.com/in/sergey-krivtsov-677419b4/)

## License

This project is licensed under the AGPL v3 License - see the [LICENSE.md](LICENSE.md) file for details
