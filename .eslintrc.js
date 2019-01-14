module.exports = {
    "env": {
        "browser": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:node/recommended"
    ],
    "parserOptions": {
        "parser": 'babel-eslint',
        "ecmaVersion": 2017
    },
    "rules": {
        "no-console": "off",
        "indent": [
            "error",
            "tab"
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "never"
        ],
        "linebreak-style": 0
    }
};