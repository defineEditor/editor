module.exports = {
	"extends" : ["standard", "eslint:recommended", "plugin:react/recommended"],
    "ecmaVersion": 8,
	"parserOptions": {
		"ecmaFeatures": {
			"jsx": true,
			"es6": true,
			"modules": true
		}
	},
	"settings": {
		"react": {
			"createClass": "createReactClass", // Regex for Component Factory to use,
			// default to "createReactClass"
			"pragma": "React"  // Pragma to use, default to "React"
		},
		"propWrapperFunctions": [ "forbidExtraProps" ] // The names of any functions used to wrap the
		// propTypes object, e.g. `forbidExtraProps`.
		// If this isn't set, any propTypes wrapped in
		// a function will be skipped.
	},
	"plugins": [
		"react"
	],
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
		}],
		"react/no-string-refs" : 0,
		"react/prop-types" : 0,
        "no-console" : 0
	}
};
