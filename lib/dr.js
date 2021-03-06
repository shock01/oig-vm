(function(root, factory) {
  'use strict';
  /* istanbul ignore next */
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.OIGDomRenderer = factory();
  }
}(this, function() {
  'use strict';
  /**@const*/
  var SHALLOW = 0x1;
  /**@const*/
  var IGNORE_COMMENT = 0x2;
  /**@const*/
  var IGNORE_TEXT = 0x4;
  /**@const*/
  var USE_FRAGMENT = 0x8;
  /**@const*/
  var TEXT_NODE = Node.TEXT_NODE;
  /**@const*/
  var ELEMENT_NODE = Node.ELEMENT_NODE;
  /**@const*/
  var COMMENT_NODE = Node.COMMENT_NODE;
  /**@const*/
  var CONTENT_TYPE_XML = 'text/xml';
  /**@const*/
  var XMLNS = 'http://www.w3.org/2000/xmlns/';
  /**@const*/
  var XMLNS_XHTML = 'http://www.w3.org/1999/xhtml';

  /**
   * Options
   * @typedef {Object} Options
   * @property {Number} flags
   */
  /**
  * @constructor
  */
  function DomRenderer() {
  }

  DomRenderer.prototype = {
    render: function( /**Element*/ sourceElement,
    /**Element*/ targetElement,
    /**Number*/ flags,
    /**String?*/ sourceSelector,
    /**String*/ targetSelector) /**{Element|string}*/ {

      if (!targetElement.parentNode) {
        // remove the fragment
        flags &= ~USE_FRAGMENT;
        targetElement.ownerDocument.createDocumentFragment().appendChild(targetElement);
      }
      this.visit(this.element(sourceElement, sourceSelector),
        this.element(targetElement, targetSelector), targetElement.ownerDocument, flags);
      return targetElement;
    },
    /**
    * @private
    */
    element: function( /**Element*/ element, /**String?*/ selector) /**Element*/ {
      var result = element;
      if (typeof selector === 'string') {
        result = element.querySelector(selector);
        if (result === null) {
          throw 'Element not found using selector: ' + selector;
        }
      }
      result.normalize();
      return result;
    },
    /**
    * @private
    */
    mergeAttributes: function( /**Element*/ source, /**Element*/ target) {
      var sourceAttributes = source.attributes,
        targetAttributes = target.attributes,
        i = Math.max(sourceAttributes.length, targetAttributes.length),
        sourceAttr,
        targetAttr;

      while (i--) {
        sourceAttr = sourceAttributes[i];
        targetAttr = targetAttributes[i];
        if (sourceAttr) {
          if (!targetAttr || (this.isSameNode(targetAttr, sourceAttr) && sourceAttr.value !== targetAttr.value)) {
            target.setAttributeNS(sourceAttr.namespaceURI, sourceAttr.localName, sourceAttr.value);
          }
        } else {
          target.removeAttributeNS(targetAttr.namespaceURI, targetAttr.localName);
        }
      }
    },
    /**
    * @private
    */
    isSameNode: function( /**Element*/ left, /**Element*/ right) {
      return left.nodeType === right.nodeType && left.namespaceURI === right.namespaceURI && left.localName === right.localName;
    },
    /**
    * @private
    */
    importNode: function( /**Node*/ node, /**Document*/ ownerDocument, /**Boolean?*/ deep) /**Node*/ {
      if (node.nodeType === ELEMENT_NODE) {
        return ownerDocument.importNode(node, deep);
      } else if (node.nodeType === TEXT_NODE) {
        return ownerDocument.createTextNode(node.textContent);
      } else if (node.nodeType === COMMENT_NODE) {
        return ownerDocument.createComment(node.textContent);
      }
    },
    /**
    * @private
    */
    removeSiblings: function( /**Node*/ node) {
      var current;
      while (node) {
        current = node.nextSibling;
        node.parentNode.removeChild(node);
        node = current;
      }
    },

    visit: function( /**Element*/ source, /**Element*/ target, /**Document*/ ownerDocument, /**Number*/ flags) /**Element*/ {
      var /**Element*/
      newTarget;

      if (target) {
        if (this.isSameNode(source, target)) {
          if (((flags & IGNORE_TEXT && !source.firstElementChild) ||
            (source.nodeType === COMMENT_NODE || source.nodeType === TEXT_NODE)) &&
            target.textContent !== source.textContent) {
            target.textContent = source.textContent;
          }
        } else {
          newTarget = this.importNode(source, ownerDocument, flags & SHALLOW === 0);
          target.parentNode.replaceChild(newTarget, target);
          target = newTarget;
        }
      } else {
        newTarget = this.importNode(source, ownerDocument, flags & SHALLOW === 0);
        target.parentNode.appendChild(newTarget);
        target = newTarget;
      }

      this.visitChildren(source, target, ownerDocument, flags);

      if (source.nodeType === ELEMENT_NODE) {
        this.mergeAttributes(source, target);
      }

      return target;
    },
    /**
    * @private
    */
    visitChildren: function( /**Element*/ source, /**Element*/ target, /**Document*/ ownerDocument, /**Number*/ flags) {
      var /**Node*/
        sourceNode,
        /**Node*/
        targetNode,
        /**DocumentFragment*/
        fragment,
        /**NodeList*/
        sourceIterator,
        /**NodeList*/
        targetIterator,
        i = 0;

      targetIterator = flags & IGNORE_TEXT ? target.children : target.childNodes;
      sourceIterator = flags & IGNORE_TEXT ? source.children : source.childNodes;

      if (sourceIterator.length) {
        if (flags & USE_FRAGMENT) {
          fragment = ownerDocument.createDocumentFragment();
        }
        while ((sourceNode = sourceIterator[i])) {
          targetNode = targetIterator[i];
          if (flags & IGNORE_COMMENT) {
            if (targetNode && targetNode.nodeType === COMMENT_NODE) {
              targetNode.parentNode.removeChild(targetNode);
              targetNode = targetIterator[i];
            }
            if (sourceNode.nodeType === COMMENT_NODE) {
              i++;
              continue;
            }
          }
          if (targetNode) {
            this.visit(sourceNode, targetNode, ownerDocument, flags);
          } else {
            targetNode = this.importNode(sourceNode, ownerDocument, true);
            if (flags & USE_FRAGMENT) {
              fragment.appendChild(targetNode);
            } else {
              target.appendChild(targetNode);
            }
          }
          i++;
        } // end while
        if (fragment && fragment.childNodes.length) {
          target.appendChild(fragment);
        }
      }
      this.removeSiblings(targetIterator[i]);
    }
  };
  /**
  * corrects namespaces and attributes when partial content does not contain namespaceURI declarations.
  * eg. <use xlink:href=""/>
  * requires targetDocument to contain the namespace qualifier to have the same name
  * will not validate valid QNames
  */
  function parseFromString( /**String*/ source, /**Document*/ targetDocument) /**Node*/ {
    var document,
      // @FIXME make sure to use the correct regex for attribute QName
      regEx = /((?:\s|<)([^:\s>]+)):/g,
      prefix,
      ns,
      m;

    m = regEx.exec(source);
    if (m === null) {
      document = targetDocument.implementation.createHTMLDocument();
      document.documentElement.innerHTML = source;
      return document.documentElement.querySelector('body').firstElementChild;
    } else {
      document = targetDocument.implementation.createDocument(XMLNS_XHTML, 'html', null);
      do {
        prefix = m[2];
        if (document.lookupNamespaceURI(prefix) === null) {
          ns = targetDocument.lookupNamespaceURI(prefix);
          if (ns !== null) {
            document.documentElement.setAttributeNS(XMLNS, 'xmlns:' + prefix, ns);
          }
        }
      } while ((m = regEx.exec(source)) !== null);
      document.documentElement.innerHTML = source;
      return document.documentElement.firstElementChild;
    }

    // add all the namespaces and set the innerHTML

  }

  var factory = function() {
    /**
    * expose public API
    */
    var instance = new DomRenderer();
    return {
      render: function( /**Element|String*/ source,
        /**Element*/ targetElement,
        /**Options*/ options) /**Element*/ {
        var sourceElement,
          opts = options || {};
        if (typeof source === 'string') {
          sourceElement = new DOMParser().parseFromString(source, CONTENT_TYPE_XML).documentElement;
          if (sourceElement === null || sourceElement.getElementsByTagName('parsererror').length) {
            sourceElement = parseFromString(source, targetElement.ownerSVGDocument || targetElement.ownerDocument);
          }
        } else {
          sourceElement = source;
        }
        if (sourceElement === null) {
          throw 'No sourceElement specified or source string not parseable';
        }
        return instance.render(sourceElement, targetElement, opts.flags, opts.sourceSelector, opts.targetSelector);
      }
    };
  };
  factory.SHALLOW = SHALLOW;
  factory.IGNORE_COMMENT = IGNORE_COMMENT;
  factory.IGNORE_TEXT = IGNORE_TEXT;
  factory.USE_FRAGMENT = USE_FRAGMENT;

  return factory;
}));
