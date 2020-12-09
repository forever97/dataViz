(function () {

    d3.layout = {};

    rebind = function(object, method) {
        return function() {
            var x = method.apply(object, arguments);
            return arguments.length ? object : x;
        };
    };

    d3.layout.hierarchy = function () {
        var sort = d3_layout_hierarchySort,
            children = d3_layout_hierarchyChildren,
            value = d3_layout_hierarchyValue;

        // Recursively compute the node depth and value.
        // Also converts the data representation into a standard hierarchy structure.
        function recurse(data, depth, nodes) {
            var childs = children.call(hierarchy, data, depth),
                node = d3_layout_hierarchyInline ? data : { data: data };
            node.depth = depth;
            nodes.push(node);
            if (childs && (n = childs.length)) {
                var i = -1,
                    n,
                    c = node.children = [],
                    v = 0,
                    j = depth + 1;
                while (++i < n) {
                    d = recurse(childs[i], j, nodes);
                    d.parent = node;
                    c.push(d);
                    v += d.value;
                }
                if (sort) c.sort(sort);
                if (value) node.value = v;
            } else if (value) {
                node.value = +value.call(hierarchy, data, depth) || 0;
            }
            return node;
        }

        // Recursively re-evaluates the node value.
        function revalue(node, depth) {
            var children = node.children,
                v = 0;
            if (children && (n = children.length)) {
                var i = -1,
                    n,
                    j = depth + 1;
                while (++i < n) v += revalue(children[i], j);
            } else if (value) {
                v = +value.call(hierarchy, d3_layout_hierarchyInline ? node : node.data, depth) || 0;
            }
            if (value) node.value = v;
            return v;
        }

        function hierarchy(d) {
            var nodes = [];
            recurse(d, 0, nodes);
            return nodes;
        }

        hierarchy.sort = function (x) {
            if (!arguments.length) return sort;
            sort = x;
            return hierarchy;
        };

        hierarchy.children = function (x) {
            if (!arguments.length) return children;
            children = x;
            return hierarchy;
        };

        hierarchy.value = function (x) {
            if (!arguments.length) return value;
            value = x;
            return hierarchy;
        };

        // Re-evaluates the `value` property for the specified hierarchy.
        hierarchy.revalue = function (root) {
            revalue(root, 0);
            return root;
        };

        return hierarchy;
    };

    // 层次结构子类方法分配助手
    function d3_layout_hierarchyRebind(object, hierarchy) {
        object.sort = rebind(object, hierarchy.sort);
        object.children = rebind(object, hierarchy.children);
        object.links = d3_layout_hierarchyLinks;
        object.value = rebind(object, hierarchy.value);

        // 如果使用新的API，则采用内联
        object.nodes = function (d) {
            d3_layout_hierarchyInline = true;
            return (object.nodes = object)(d);
        };

        return object;
    }

    function d3_layout_hierarchyChildren(d) {
        return d.children;
    }

    function d3_layout_hierarchyValue(d) {
        return d.value;
    }

    function d3_layout_hierarchySort(a, b) {
        return b.value - a.value;
    }

    // 返回指定节点的数组 source + target 对象
    function d3_layout_hierarchyLinks(nodes) {
        return d3.merge(nodes.map(function (parent) {
            return (parent.children || []).map(function (child) {
                return { source: parent, target: child };
            });
        }));
    }

    // 为了向后兼容，默认情况下不启用内联
    var d3_layout_hierarchyInline = false;
    
    // Squarified Treemaps by Mark Bruls, Kees Huizing, and Jarke J. van Wijk
    // Modified to support a target aspect ratio by Jeff Heer
    d3.layout.treemap = function () {
        var hierarchy = d3.layout.hierarchy(),
            round = Math.round,
            size = [1, 1], // 宽度，高度
            padding = null,
            pad = d3_layout_treemapPadNull,
            sticky = false,
            stickies,
            ratio = 0.5 * (1 + Math.sqrt(5)); // 黄金分割率

        // 计算面积
        function scale(child, k) {
            for (let i = 0; i < child.length; i++) {
                let area = child[i].value * (k < 0 ? 0 : k);
                child[i].area = isNaN(area) || area <= 0 ? 0 : area;
            }
        }

        // Recursively arranges the specified node's children into squarified rows.
        function squarify(node) {
            var children = node.children;
            if (children && children.length) {
                var rect = pad(node),
                    row = [],
                    remaining = children.slice(), // copy-on-write
                    child,
                    best = Infinity, // the best row score so far
                    score, // the current row score
                    u = Math.min(rect.dx, rect.dy), // initial orientation
                    n;
                scale(remaining, rect.dx * rect.dy / node.value);
                row.area = 0;
                while ((n = remaining.length) > 0) {
                    row.push(child = remaining[n - 1]);
                    row.area += child.area;
                    if ((score = worst(row, u)) <= best) { // continue with this orientation
                        remaining.pop();
                        best = score;
                    } else { // abort, and try a different orientation
                        row.area -= row.pop().area;
                        position(row, u, rect, false);
                        u = Math.min(rect.dx, rect.dy);
                        row.length = row.area = 0;
                        best = Infinity;
                    }
                }
                if (row.length) {
                    position(row, u, rect, true);
                    row.length = row.area = 0;
                }
                children.forEach(squarify);
            }
        }

        // 递归地将指定节点的子级调整为现有的行
        // 保持现有布局
        function stickify(node) {
            var children = node.children;
            if (children && children.length) {
                var rect = pad(node),
                    remaining = children.slice(), // copy-on-write
                    child,
                    row = [];
                scale(remaining, rect.dx * rect.dy / node.value);
                row.area = 0;
                while (child = remaining.pop()) {
                    row.push(child);
                    row.area += child.area;
                    if (child.z != null) {
                        position(row, child.z ? rect.dx : rect.dy, rect, !remaining.length);
                        row.length = row.area = 0;
                    }
                }
                children.forEach(stickify);
            }
        }

        // Computes the score for the specified row, as the worst aspect ratio.
        function worst(row, u) {
            var s = row.area,
                r,
                rmax = 0,
                rmin = Infinity,
                i = -1,
                n = row.length;
            while (++i < n) {
                if (!(r = row[i].area)) continue;
                if (r < rmin) rmin = r;
                if (r > rmax) rmax = r;
            }
            s *= s;
            u *= u;
            return s
                ? Math.max((u * rmax * ratio) / s, s / (u * rmin * ratio))
                : Infinity;
        }

        // Positions the specified row of nodes. Modifies `rect`.
        function position(row, u, rect, flush) {
            var i = -1,
                n = row.length,
                x = rect.x,
                y = rect.y,
                v = u ? round(row.area / u) : 0,
                o;
            if (u == rect.dx) { // 水平划分
                if (flush || v > rect.dy) v = v ? rect.dy : 0; // over+underflow
                while (++i < n) {
                    o = row[i];
                    o.x = x;
                    o.y = y;
                    o.dy = v;
                    x += o.dx = v ? round(o.area / v) : 0;
                }
                o.z = true;
                o.dx += rect.x + rect.dx - x; // rounding error
                rect.y += v;
                rect.dy -= v;
            } else { // 垂直划分
                if (flush || v > rect.dx) v = v ? rect.dx : 0; // over+underflow
                while (++i < n) {
                    o = row[i];
                    o.x = x;
                    o.y = y;
                    o.dx = v;
                    y += o.dy = v ? round(o.area / v) : 0;
                }
                o.z = false;
                o.dy += rect.y + rect.dy - y; // rounding error
                rect.x += v;
                rect.dx -= v;
            }
        }

        function treemap(d) {
            var nodes = stickies || hierarchy(d),
                root = nodes[0];
            root.x = 0;
            root.y = 0;
            root.dx = size[0];
            root.dy = size[1];
            if (stickies) hierarchy.revalue(root);
            scale([root], root.dx * root.dy / root.value);
            (stickies ? stickify : squarify)(root);
            if (sticky) stickies = nodes;
            return nodes;
        }

        treemap.size = function (x) {
            if (!arguments.length) return size;
            size = x;
            return treemap;
        };

        treemap.padding = function (x) {
            if (!arguments.length) return padding;

            function padFunction(node) {
                var p = x.call(treemap, node, node.depth);
                return p == null
                    ? d3_layout_treemapPadNull(node)
                    : d3_layout_treemapPad(node, typeof p === "number" ? [p, p, p, p] : p);
            }

            function padConstant(node) {
                return d3_layout_treemapPad(node, x);
            }

            var type;
            pad = (padding = x) == null ? d3_layout_treemapPadNull
                : (type = typeof x) === "function" ? padFunction
                    : type === "number" ? (x = [x, x, x, x], padConstant)
                        : padConstant;
            return treemap;
        };

        treemap.round = function (x) {
            if (!arguments.length) return round != Number;
            round = x ? Math.round : Number;
            return treemap;
        };

        treemap.sticky = function (x) {
            if (!arguments.length) return sticky;
            sticky = x;
            stickies = null;
            return treemap;
        };

        treemap.ratio = function (x) {
            if (!arguments.length) return ratio;
            ratio = x;
            return treemap;
        };

        return d3_layout_hierarchyRebind(treemap, hierarchy);
    };

    function d3_layout_treemapPadNull(node) {
        return { x: node.x, y: node.y, dx: node.dx, dy: node.dy };
    }

    function d3_layout_treemapPad(node, padding) {
        var x = node.x + padding[3],
            y = node.y + padding[0],
            dx = node.dx - padding[1] - padding[3],
            dy = node.dy - padding[0] - padding[2];
        if (dx < 0) { x += dx / 2; dx = 0; }
        if (dy < 0) { y += dy / 2; dy = 0; }
        return { x: x, y: y, dx: dx, dy: dy };
    }
})();