/**
 * This file contains the learning view and appropo subviews and must be loaded
 * after the models and collections
 */


(function(AGFK, Backbone, _, $, undefined){
    "use strict";

    /**
     * Display the model as an item in the node list
     */
    AGFK.NodeListItemView = (function(){
        // define private variables and methods
        var pvt = {};

        pvt.parentView = null;
        
        pvt.viewConsts = {
            templateId: "node-title-view-template", // name of view template (warning: hardcoded in html)
            learnedClass: "learned-concept-title",
            implicitLearnedClass: "implicit-learned-concept-title",
            viewClass: "learn-title-display",
            viewIdPrefix: "node-title-view-div-",
            learnedCheckClass: "lcheck"
        };

        // return public object
        return Backbone.View.extend({
            template: _.template(document.getElementById( pvt.viewConsts.templateId).innerHTML),
            id: function(){ return pvt.viewConsts.viewIdPrefix +  this.model.id;},
            className: function(){
                var viewConsts = pvt.viewConsts,
                thisView = this,
                thisModel = thisView.model;
                return pvt.viewConsts.viewClass + (thisModel.getLearnedStatus() ? " " + viewConsts.learnedClass : "") + (thisModel.getImplicitLearnCt() > 0 ? " " + viewConsts.implicitLearnedClass : "");
            },

            events: {
                "click .learn-view-check": "toggleLearnedConcept"
            },

            /**
             * Initialize the view with appropriate listeners
             */
            initialize: function(){
                var thisView = this,
                viewConsts = pvt.viewConsts,
                learnClass = viewConsts.learnedClass,
                implicitLearnedClass = viewConsts.implicitLearnedClass;
                thisView.listenTo(thisView.model, "change:learnStatus", function(nodeId, status){
                    thisView.changeTitleClass(learnClass, status);
                });
                thisView.listenTo(thisView.model, "change:implicitLearnStatus", function(nodeId, status){
                    thisView.changeTitleClass(implicitLearnedClass, status);
                });
            },
            
            /**
             * Render the learning view given the supplied model
             */
            render: function(){
                var thisView = this;
                var thisModel = thisView.model;
                var h = _.clone(thisModel.toJSON());
                h.title = thisModel.getLearnViewTitle();
                thisView.$el.html(thisView.template(h));
                return thisView;
            },

            /**
             * Toggle learned state of given concept
             */
            toggleLearnedConcept: function(evt){
                evt.stopPropagation();
                var lclass = pvt.viewConsts.learnedClass;
                this.model.setLearnedStatus(!this.$el.hasClass(lclass));
            },

            /**
             * Change the title display properties given by prop
             */
            changeTitleClass: function(classVal, status){
                if (status){
                    this.$el.addClass(classVal);
                }
                else{
                    this.$el.removeClass(classVal);
                }
            },

            /**
             * Set the parent view
             */
            setParentView: function(pview){
                pvt.parentView = pview;
            },

            /**
             * Get the parent view
             */
            getParentView: function(){
                return pvt.pview;
            }
        });
    })();


    /**
     * View to display detailed resource information
     */
    AGFK.ResourceView = (function(){
        // define private variables and methods
        var pvt = {};

        pvt.viewConsts = {
            templateId: "resource-view-template",
            viewClass: "resource-view",
            viewIdPrefix: "resource-details-",
            extraResourceInfoClass: "extra-resource-details"
        };

        // return public object
        return Backbone.View.extend({
            template: _.template(document.getElementById( pvt.viewConsts.templateId).innerHTML),
            id: function(){ return pvt.viewConsts.viewIdPrefix +  this.model.cid;},
            className: pvt.viewConsts.viewClass,

            events: {
                'click .more-resource-info': 'toggleAdditionalInfo'
            },
            
            /**
             * Render the learning view given the supplied model
             */
            render: function(){
                var thisView = this;
                thisView.$el.html(thisView.template(thisView.model.toJSON()));
                return thisView;
            },

            toggleAdditionalInfo: function(evt){
                this.$el.find("." + pvt.viewConsts.extraResourceInfoClass).toggle();
                $(evt.currentTarget).remove();
            }

        });
    })();


    /**
     * Wrapper view to display all dependencies
     */
    AGFK.ResourcesSectionView = (function(){
        // define private variables and methods
        var pvt = {};

        pvt.viewConsts = {
            viewClass: "resources-wrapper",
            viewIdPrefix: "resources-wrapper-"
        };

        // return public object
        return Backbone.View.extend({
            id: function(){ return pvt.viewConsts.viewIdPrefix +  this.model.cid;},
            className: pvt.viewConsts.viewClass,
            
            /**
             * Render the learning view given the supplied model
             */
            render: function(){
                var thisView = this;
                thisView.$el.html("");
                thisView.model.each(function(itm){
                    thisView.$el.append(new AGFK.ResourceView({model: itm}).render().el);
                });
                thisView.delegateEvents();
                return thisView;
            }

        });
    })();

    /**
     * View to display details of all provided resources (wrapper view)
     */
    AGFK.DependencyView = (function(){
        // define private variables and methods
        var pvt = {};

        pvt.viewConsts = {
            templateId: "dependency-view-template",
            viewClass: "dependency-view",
            viewIdPrefix: "dependency-details-"
        };

        // return public object
        return Backbone.View.extend({
            template: _.template(document.getElementById( pvt.viewConsts.templateId).innerHTML),
            id: function(){ return pvt.viewConsts.viewIdPrefix +  this.model.cid;},
            className: pvt.viewConsts.viewClass,
            
            /**
             * Render the learning view given the supplied model
             */
            render: function(){
                var thisView = this,
		thisModel = thisView.model;
		// TODO this seems awkward
                thisView.$el.html(thisView.template(_.extend(thisModel.toJSON(), 
							     {fromTitle: thisModel.graphEdgeCollection.parentModel.get("aux").getTitleFromId(thisModel.get("from_tag"))}))); 
                return thisView;
            }

        });
    })();
    
    /**
     * Wrapper view to display all dependencies
     */
    AGFK.DependencySectionView = (function(){
        // define private variables and methods
        var pvt = {};

        pvt.viewConsts = {
            viewClass: "dependencies-wrapper",
            viewIdPrefix: "dependencies-wrapper-"
        };

        // return public object
        return Backbone.View.extend({
            id: function(){ return pvt.viewConsts.viewIdPrefix +  this.model.cid;},
            className: pvt.viewConsts.viewClass,
            
            /**
             * Render the learning view given the supplied model
             */
            render: function(){
                var thisView = this;
                thisView.$el.html("");
                thisView.model.each(function(itm){
                    thisView.$el.append(new AGFK.DependencyView({model: itm}).render().el);
                });
                thisView.delegateEvents();
                return thisView;
            }

        });
    })();

    /**
     * View to display details of all provided resources (wrapper view)
     */
    AGFK.OutlinkView = (function(){
        // define private variables and methods
        var pvt = {};

        pvt.viewConsts = {
            templateId: "outlink-view-template",
            viewClass: "outlink-view",
            viewIdPrefix: "outlink-details-"
        };

        // return public object
        return Backbone.View.extend({
            template: _.template(document.getElementById( pvt.viewConsts.templateId).innerHTML),
            id: function(){ return pvt.viewConsts.viewIdPrefix +  this.model.cid;},
            className: pvt.viewConsts.viewClass,
            
            /**
             * Render the learning view given the supplied model
             */
            render: function(){
                var thisView = this,
		thisModel = thisView.model;
                thisView.$el.html(thisView.template(_.extend(thisModel.toJSON(), {toTitle: thisModel.graphEdgeCollection.parentModel.get("aux").getTitleFromId(thisModel.get("to_tag"))})));
                return thisView;
            }

        });
    })();


    /**
     * Wrapper view to display all outlinks
     */
    AGFK.OutlinkSectionView = (function(){
        // define private variables and methods
        var pvt = {};

        pvt.viewConsts = {
            viewClass: "outlinks-wrapper",
            viewIdPrefix: "outlinks-wrapper-"
        };

        // return public object
        return Backbone.View.extend({
            id: function(){ return pvt.viewConsts.viewIdPrefix +  this.model.cid;},
            className: pvt.viewConsts.viewClass,
            
            /**
             * Render the view given the supplied model
             */
            render: function(){
                var thisView = this;
                thisView.$el.html("");
                thisView.model.each(function(itm){
                    thisView.$el.append(new AGFK.OutlinkView({model: itm}).render().el);
                });
                thisView.delegateEvents();
                return thisView;
            }

        });
    })();


    /**
     * View to display additional notes/pointers
     * NOTE: expects a javascript model as input (for now) with one field: text
     */
    AGFK.PointersView = (function(){
        // define private variables and methods
        var pvt = {
        };

        pvt.viewConsts = {
            templateId: "pointers-view-template",
            viewClass: "pointers-view",
            viewIdPrefix: "pointers-view-"
        };

        /**
         * Parse the tags in the pointer string
         */
        pvt.parsePtrStr = function(ptrStr){
            return ptrStr.replace(new RegExp("\\[([^\\s]+)\\]", "g"),
                                  function(all, text, ch){
                                      return '[<a class="internal-link" href="' + window.GRAPH_CONCEPT_PATH + text.replace(/[-]/g,"_") + '">' + text.replace(/[-_]/g," ") + '</a>]'; // TODO fix hardcoded urls
                                      });
        };

        // return public object
        return Backbone.View.extend({
            template: _.template(document.getElementById( pvt.viewConsts.templateId).innerHTML),
            id: function(){ return pvt.viewConsts.viewIdPrefix +  this.model.cid;},
            className: pvt.viewConsts.viewClass,
            
            /**
             * Render the learning view given the supplied model
             */
            render: function(){
                var thisView = this;
                thisView.$el.html(thisView.template({htmlStr: thisView.parsePtrTextToHtml(thisView.model.text)}));
                return thisView;
            },

            /**
             * Parse the markup-style pointer text to html list
             * TODO separate HTML generation better
             */
            parsePtrTextToHtml: function(ptrText){
                var ptrArr = ptrText.split(/(?=\*)/),
                i,
                depth = 0,
                prevDepth = 0,
                tmpDepth,
                htmlStr = "<ul>",
                liStr;

                // array depth corresponds to list depth
                for (i = 0; i < ptrArr.length; i++){
                    if (ptrArr[i] === "*"){
                        depth++;
                    }
                    else{
                        tmpDepth = depth;
                        while (depth < prevDepth){
                            htmlStr += '</ul>\n';
                            depth++;
                        }

                        while (depth > prevDepth){
                            htmlStr += '<ul>';
                            depth--;
                        }
                        liStr = pvt.parsePtrStr(ptrArr[i].substring(1));
                        htmlStr += "<li>" + liStr + "</li>\n";
                        
                        prevDepth = tmpDepth;
                        depth = 0;
                    }
                }
                while (prevDepth--){
                    htmlStr += '</ul>\n';
                }
                htmlStr += "</ul>";
                
                return htmlStr;
            }
        });
    })();
    

    /**
     * Displays detailed node information
     */
    AGFK.DetailedNodeView = (function(){
        // define private variables and methods
        var pvt = {};

        pvt.viewConsts = {
            templateId: "node-detail-view-template", // name of view template (warning: hardcoded in html)
            viewTag: "section",
            viewIdPrefix: "node-detail-view-",
            viewClass: "node-detail-view",
            freeResourcesLocClass: 'free-resources-wrap', // classes are specified in the node-detail template
            paidResourcesLocClass: 'paid-resources-wrap',
            depLocClass: 'dep-wrap',
            ptrLocClass: 'pointers-wrap',
            outlinkLocClass: 'outlinks-wrap'
        };

        // return public object
        return Backbone.View.extend({
            template: _.template(document.getElementById( pvt.viewConsts.templateId).innerHTML),
            id: function(){ return pvt.viewConsts.viewIdPrefix + this.model.get("id");},
            tagName: pvt.viewConsts.viewTag,
            className: pvt.viewConsts.viewClass,
            
            /**
             * Render the learning view given the supplied model TODO consider using setElement instead of html
             * TODO try to reduce the boiler-plate repetition in rendering this view
             */
            render: function(){
                var thisView = this,
                viewConsts = pvt.viewConsts,
                assignObj = {},
                freeResourcesLocClass = "." + viewConsts.freeResourcesLocClass,
                paidResourcesLocClass = "." + viewConsts.paidResourcesLocClass,
                depLocClass = "." + viewConsts.depLocClass,
                outlinkLocClass = "." + viewConsts.outlinkLocClass,
                ptrLocClass = "." + viewConsts.ptrLocClass;
                
                thisView.$el.html(thisView.template(thisView.model.toJSON()));
                thisView.fresources =
                    thisView.fresource || new AGFK.ResourcesSectionView({model: thisView.model.get("resources").getFreeResources()});
                thisView.presources = thisView.presources || new AGFK.ResourcesSectionView({model: thisView.model.get("resources").getPaidResources()});
                thisView.dependencies = thisView.dependencies || new AGFK.DependencySectionView({model: thisView.model.get("dependencies")});
                thisView.outlinks = thisView.outlinks || new AGFK.OutlinkSectionView({model: thisView.model.get("outlinks")});
                thisView.pointers = thisView.pointers || new AGFK.PointersView({model: {text: thisView.model.get("pointers")}});
                if (thisView.fresources.model.length > 0){
                    assignObj[freeResourcesLocClass] = thisView.fresources;
                }
                if (thisView.presources.model.length > 0){
                    assignObj[paidResourcesLocClass] = thisView.presources;
                }
                if (thisView.dependencies.model.length > 0){
                    assignObj[depLocClass] = thisView.dependencies;
                }
                if (thisView.outlinks.model.length > 0){
                    assignObj[outlinkLocClass] = thisView.outlinks;
                }
                if (thisView.pointers.model.text.length > 1){
                    assignObj[ptrLocClass] = thisView.pointers;
                }
                
                thisView.assign(assignObj);
                thisView.delegateEvents();
                return thisView;
            },

            /**
             * Assign subviews: method groked from http://ianstormtaylor.com/assigning-backbone-subviews-made-even-cleaner/
             */
            assign : function (selector, view) {
                var selectors;
                if (_.isObject(selector)) {
                    selectors = selector;
                }
                else {
                    selectors = {};
                    selectors[selector] = view;
                }
                if (!selectors) return;
                _.each(selectors, function (view, selector) {
                    view.setElement(this.$(selector)).render();
                }, this);
            },

            /**
             * Clean up the view properly
             */
            close: function(){
                this.unbind();
                this.remove();
            }

        });
    })();

    /**
     * Main learning view
     */
    AGFK.LearnView = (function(){
        // define private variables and methods
        var pvt = {};

        // keep track of expanded nodes: key: title node id, value: expanded view object
        pvt.expandedNodes = {};

        pvt.nodeOrdering = null;

        pvt.viewConsts = {
            viewId: "learn-view",
            clickedItmClass: "clicked-title"
        };

        /**
         * Insert a given subview after the specified dom node
         */
        pvt.insertSubViewAfter = function(subview, domNode){
            domNode.parentNode.insertBefore(subview.render().el, domNode.nextSibling);
        };

        // return public object
        return Backbone.View.extend({
            id: pvt.viewConsts.viewId,

            events: {
                "click .learn-title-display": "showNodeDetailsFromEvt"
            },

            /**
             * Display the given nodes details from the given event
             * and store the currentTarget.id:subview in pvt.expandedNodes
             */
            showNodeDetailsFromEvt: function(evt){
                var thisView = this,
                clkEl = evt.currentTarget,
                clkElClassList = clkEl.classList,
                nid,
                clickedItmClass = pvt.viewConsts.clickedItmClass;
                clkElClassList.toggle(clickedItmClass);
                if (clkElClassList.contains(clickedItmClass)){ 
                    nid = clkEl.id.split("-").pop();
                    var dnode = thisView.appendDetailedNodeAfter(thisView.model.get("nodes").get(nid), clkEl);
                    pvt.expandedNodes[clkEl.id] = dnode;
                }
                else{
                    if (pvt.expandedNodes.hasOwnProperty(clkEl.id)){
                        var expView = pvt.expandedNodes[clkEl.id];
                        expView.close();
                        delete pvt.expandedNodes[clkEl.id];
                    }
                }
            },

            /**
             * Append detailed node view to given element id that is a child of thisView
             * Returns the view object for the appended node
             */
            appendDetailedNodeAfter: function(nodeModel, domNode){
                var thisView = this,
                dNodeView = new AGFK.DetailedNodeView({model: nodeModel});
                pvt.insertSubViewAfter(dNodeView, domNode);
                return dNodeView;
            },
            
            /**
             * Render the learning view given the supplied collection
             * TODO rerender (the appropriate section) when the model changes
             */
            render: function(){
                var thisView = this,
                $el = thisView.$el,
                expandedNodes = pvt.expandedNodes,
                clkItmClass = pvt.viewConsts.clickedItmClass;

                $el.html(""); // TODO we shouldn't be doing this -- handle the subviews better
                pvt.nodeOrdering = thisView.getTopoSortedConcepts();
                thisView.renderTitles();
                
                // recapture previous expand/collapse state TODO is this desirable behavior?
                for (var expN in expandedNodes){
                    if (expandedNodes.hasOwnProperty(expN)){
                        var domEl = document.getElementById(expN);
                        pvt.insertSubViewAfter(expandedNodes[expN], domEl);
                        domEl.classList.add(clkItmClass);
                        
                    }
                }
                thisView.delegateEvents();
                return thisView;
            },

            /**
             * Render the learning view titles 
             */
            renderTitles: function(){
		var thisView = this,
                inum,
                noLen,
                nodeOrdering = pvt.nodeOrdering || thisView.getTopoSortedConcepts(),
                curNode,
                nid,
                nliview,
                $el = thisView.$el,
                thisModel = thisView.model,
                nodes = thisModel.get("nodes");
                
                for (inum = 0, noLen = nodeOrdering.length; inum < noLen; inum++){
                    curNode = nodes.get(nodeOrdering[inum]);
                    nid = curNode.get("id");
                    nliview = new AGFK.NodeListItemView({model: curNode});
                    nliview.setParentView(thisView);
                    $el.append(nliview.render().el); 
                }
            },

            /**
             * Clean up the view
             */
            close: function(){
		var expN,
		expandedNodes = pvt.expandedNodes,
		domeEl;
                for (expN in expandedNodes){
                    if (expandedNodes.hasOwnProperty(expN)){
                        var domEl = document.getElementById(expN);
                        expandedNodes[expN].close();
                        delete expandedNodes[expN];
                    }
                }
                this.remove();
                this.unbind();
            },

            /**
             * Compute the learning view ordering (topological sort)
             * TODO this function may be migrated 
             * if the view ordering is user-dependent
             */
            getTopoSortedConcepts: function(){
		var thisView = this,
		keyTag = thisView.model.get("aux").get("depRoot") || "",
                nodes = thisView.model.get("nodes"),
		traversedNodes = {}, // keep track of traversed nodes
		startRootNodes; // nodes already added to the list

                if (keyTag === ""){
                    // init: obtain node tags with 0 outlinks (root nodes)
                    startRootNodes = _.map(nodes.filter(function(mdl){
                        return mdl.get("outlinks").length == 0;
                    }), function(itm){
                        return itm.get("id");
                    });
                }
                else{
		    // root node is the keyTag
                    startRootNodes = [keyTag];
                }

		// recursive dfs topological sort
		function dfsTopSort (rootNodeTags){
		    var curRootNodeTagDepth,
		    returnArr = [],
		    rootNodeRoundArr = [],
		    curRootNodeTag,
		    unqDepTags;

		    // recurse on the input root node tags
		    for(curRootNodeTagDepth = 0; curRootNodeTagDepth < rootNodeTags.length; curRootNodeTagDepth++){
			curRootNodeTag = rootNodeTags[curRootNodeTagDepth];
			if (!traversedNodes.hasOwnProperty(curRootNodeTag)){
			    unqDepTags = nodes.get(curRootNodeTag);
			    unqDepTags = unqDepTags ? unqDepTags.getUniqueDependencies() : [];
			    if (unqDepTags.length > 0){
				returnArr = returnArr.concat(dfsTopSort(unqDepTags));
			    }
			    returnArr.push(curRootNodeTag);
			    traversedNodes[curRootNodeTag] = 1;
			}
		    }
		    return returnArr
		};
		
                return dfsTopSort(startRootNodes);
            }
        });
    })();


})(window.AGFK = typeof window.AGFK == "object"? window.AGFK : {}, window.Backbone, window._, window.jQuery);