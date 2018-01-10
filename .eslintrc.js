module.exports = {
    "extends": "standard",
    "rules": {
        // enable additional rules
        "indent": ["error", 4],
        "linebreak-style": ["error", "unix"],
        "semi": ["error", "always"],
        "key-spacing": ["error", {
            "align": {
                "beforeColon": true,
                "afterColon": true,
                "on": "colon"
            }
        }]
    }
};
