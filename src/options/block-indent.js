module.exports = {
    name: 'block-indent',

    runBefore: 'sort-order',

    syntax: ['css', 'less', 'sass', 'scss'],

    accepts: {
        number: true,
        string: /^[ \t]*$/
    },

    /**
     * Processes tree node.
     *
     * @param {node} ast
     */
    process: function process(ast) {
        ast.eachFor('space', function(whitespaceNode, i) {
            var spaces = whitespaceNode.content.replace(/\n[ \t]+/gm, '\n');

            if (spaces === '') {
                ast.remove(i);
            } else {
                whitespaceNode.content = spaces;
            }
        });

        console.log(this);
        this._processNode(ast, 0);
    },

    /**
     * Detects the value of an option at the tree node.
     *
     * @param {node} ast
     */
    detect: function(ast) {
        var detected = [];

        ast.traverse(function(node) {
            // Continue only with non-empty {...} blocks:
            if (!node.is('atrulers') && !node.is('block') || !node.length)
                return;

            node.eachFor('space', function(whitespaceNode) {
                var spaces = whitespaceNode.content;
                var lastIndex = spaces.lastIndexOf('\n');

                // Do not continue if there is no line break:
                if (lastIndex < 0) return;

                // Number of spaces from beginning of line:
                var spacesLength = spaces.slice(lastIndex + 1).length + 1;
                detected.push(new Array(spacesLength).join(' '));
            });
        });
    },

    _processNode: function _processNode(node, level) {
        var syntax = this.getSyntax();
        var that = this;

        node.forEach(function(n) {
            if (syntax === 'sass' && n.is('block')) {
                that._processSassBlock(n, level);
            }

            // Continue only with space nodes inside {...}:
            if (syntax !== 'sass' && level !== 0 && n.is('space')) {
                that._processSpaceNode(n, level);
            }

            if (n.is('block') || n.is('atrulers')) level++;

            that._processNode(n, level);
        });
    },

    _processSassBlock: function _processSassBlock(node, level) {
        var value = this.getValue('block-indent');

        node.eachFore('space', function(whitespaceNode) {
            if (whitespaceNode.content === '\n') return;

            var spaces = whitespaceNode.content.replace(/[ \t]/gm, '');
            spaces += new Array(level + 2).join(value);
            whitespaceNode.content = spaces;
        });
    },

    _processSpaceNode: function _processSpaceNode(node, level) {
        var value = this.getValue('block-indent');

        // Remove all whitespaces and tabs, leave only new lines:
        var spaces = node.content.replace(/[ \t]/gm, '');

        if (!spaces) return;

        spaces += new Array(level + 1).join(value);
        node.content = spaces;
    }
};