// Knowledge Graph Module
const KnowledgeGraph = {
    // Graph data structure
    graph: {
        nodes: new Map(), // id -> { type, label, weight, metadata }
        edges: new Map(), // id -> { source, target, type, weight, metadata }
        nextNodeId: 1,
        nextEdgeId: 1
    },

    // Node types
    NODE_TYPES: {
        TOPIC: 'topic',
        ENTITY: 'entity',
        STYLE: 'style',
        PROMPT: 'prompt'
    },

    // Edge types
    EDGE_TYPES: {
        RELATED_TO: 'related_to',
        USES: 'uses',
        SIMILAR_TO: 'similar_to',
        LEADS_TO: 'leads_to'
    },

    // Initialize the graph
    init() {
        this.graph.nodes.clear();
        this.graph.edges.clear();
        this.graph.nextNodeId = 1;
        this.graph.nextEdgeId = 1;
    },

    // Add a node to the graph
    addNode(type, label, metadata = {}) {
        const id = `node_${this.graph.nextNodeId++}`;
        this.graph.nodes.set(id, {
            type,
            label,
            weight: 1,
            metadata: {
                ...metadata,
                firstSeen: new Date().toISOString(),
                lastSeen: new Date().toISOString()
            }
        });
        return id;
    },

    // Add an edge to the graph
    addEdge(source, target, type, metadata = {}) {
        const id = `edge_${this.graph.nextEdgeId++}`;
        this.graph.edges.set(id, {
            source,
            target,
            type,
            weight: 1,
            metadata: {
                ...metadata,
                firstSeen: new Date().toISOString(),
                lastSeen: new Date().toISOString()
            }
        });
        return id;
    },

    // Update node weight and metadata
    updateNode(nodeId, weight = 1, metadata = {}) {
        const node = this.graph.nodes.get(nodeId);
        if (node) {
            node.weight += weight;
            node.metadata = {
                ...node.metadata,
                ...metadata,
                lastSeen: new Date().toISOString()
            };
        }
    },

    // Update edge weight and metadata
    updateEdge(edgeId, weight = 1, metadata = {}) {
        const edge = this.graph.edges.get(edgeId);
        if (edge) {
            edge.weight += weight;
            edge.metadata = {
                ...edge.metadata,
                ...metadata,
                lastSeen: new Date().toISOString()
            };
        }
    },

    // Process a prompt and update the graph
    processPrompt(prompt, type, score, criteria, topics, entities, styles) {
        // Add prompt node
        const promptId = this.addNode(this.NODE_TYPES.PROMPT, prompt, {
            type,
            score,
            criteria
        });

        // Process topics
        const topicNodes = new Map();
        topics.forEach(topic => {
            const topicId = this.addNode(this.NODE_TYPES.TOPIC, topic);
            topicNodes.set(topic, topicId);
            this.addEdge(promptId, topicId, this.EDGE_TYPES.USES);
        });

        // Process entities
        const entityNodes = new Map();
        entities.forEach(entity => {
            const entityId = this.addNode(this.NODE_TYPES.ENTITY, entity);
            entityNodes.set(entity, entityId);
            this.addEdge(promptId, entityId, this.EDGE_TYPES.USES);
        });

        // Process styles
        const styleNodes = new Map();
        styles.forEach(style => {
            const styleId = this.addNode(this.NODE_TYPES.STYLE, style);
            styleNodes.set(style, styleId);
            this.addEdge(promptId, styleId, this.EDGE_TYPES.USES);
        });

        // Add relationships between topics
        for (let i = 0; i < topics.length; i++) {
            for (let j = i + 1; j < topics.length; j++) {
                this.addEdge(
                    topicNodes.get(topics[i]),
                    topicNodes.get(topics[j]),
                    this.EDGE_TYPES.RELATED_TO
                );
            }
        }

        // Add relationships between entities and topics
        entities.forEach(entity => {
            topics.forEach(topic => {
                this.addEdge(
                    entityNodes.get(entity),
                    topicNodes.get(topic),
                    this.EDGE_TYPES.RELATED_TO
                );
            });
        });

        // Add relationships between styles and topics
        styles.forEach(style => {
            topics.forEach(topic => {
                this.addEdge(
                    styleNodes.get(style),
                    topicNodes.get(topic),
                    this.EDGE_TYPES.RELATED_TO
                );
            });
        });

        return {
            promptId,
            topicNodes,
            entityNodes,
            styleNodes
        };
    },

    // Get nodes by type
    getNodesByType(type) {
        return Array.from(this.graph.nodes.entries())
            .filter(([_, node]) => node.type === type)
            .map(([id, node]) => ({ id, ...node }));
    },

    // Get edges by type
    getEdgesByType(type) {
        return Array.from(this.graph.edges.entries())
            .filter(([_, edge]) => edge.type === type)
            .map(([id, edge]) => ({ id, ...edge }));
    },

    // Get connected nodes
    getConnectedNodes(nodeId, edgeType = null) {
        const connected = new Set();
        
        this.graph.edges.forEach(edge => {
            if (edgeType && edge.type !== edgeType) return;
            
            if (edge.source === nodeId) {
                connected.add(edge.target);
            }
            if (edge.target === nodeId) {
                connected.add(edge.source);
            }
        });

        return Array.from(connected).map(id => ({
            id,
            ...this.graph.nodes.get(id)
        }));
    },

    // Get node recommendations
    getRecommendations(nodeId, limit = 5) {
        const node = this.graph.nodes.get(nodeId);
        if (!node) return [];

        // Get all connected nodes
        const connected = this.getConnectedNodes(nodeId);
        
        // Get nodes connected to connected nodes (2nd degree)
        const secondDegree = new Set();
        connected.forEach(connectedNode => {
            this.getConnectedNodes(connectedNode.id).forEach(node => {
                if (node.id !== nodeId && !connected.find(c => c.id === node.id)) {
                    secondDegree.add(node);
                }
            });
        });

        // Score and sort recommendations
        const recommendations = Array.from(secondDegree)
            .map(node => ({
                ...node,
                score: this.calculateRecommendationScore(nodeId, node.id)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        return recommendations;
    },

    // Calculate recommendation score
    calculateRecommendationScore(sourceId, targetId) {
        const source = this.graph.nodes.get(sourceId);
        const target = this.graph.nodes.get(targetId);
        if (!source || !target) return 0;

        // Base score on node weights
        let score = target.weight;

        // Boost score for nodes of the same type
        if (source.type === target.type) {
            score *= 1.5;
        }

        // Boost score for nodes with similar metadata
        if (source.metadata.type === target.metadata.type) {
            score *= 1.2;
        }

        return score;
    },

    // Export graph data for visualization
    exportForVisualization() {
        const nodes = Array.from(this.graph.nodes.entries()).map(([id, node]) => ({
            id,
            ...node
        }));

        const edges = Array.from(this.graph.edges.entries()).map(([id, edge]) => ({
            id,
            ...edge
        }));

        return { nodes, edges };
    },

    // Import graph data
    importData(data) {
        this.init();
        
        // Import nodes
        data.nodes.forEach(node => {
            this.graph.nodes.set(node.id, {
                type: node.type,
                label: node.label,
                weight: node.weight,
                metadata: node.metadata
            });
        });

        // Import edges
        data.edges.forEach(edge => {
            this.graph.edges.set(edge.id, {
                source: edge.source,
                target: edge.target,
                type: edge.type,
                weight: edge.weight,
                metadata: edge.metadata
            });
        });

        // Update next IDs
        this.graph.nextNodeId = Math.max(...Array.from(this.graph.nodes.keys())
            .map(id => parseInt(id.split('_')[1]))) + 1;
        this.graph.nextEdgeId = Math.max(...Array.from(this.graph.edges.keys())
            .map(id => parseInt(id.split('_')[1]))) + 1;
    },

    // Add this function to handle review results from the LLM or local logic
    processReviewResult(result) {
        // Defensive: if result is missing any field, use empty arrays/objects
        const prompt = result.prompt || '';
        const type = result.type || '';
        const score = result.score || 0;
        const criteria = result.criteria || {};
        const topics = result.topics || [];
        const entities = result.entities || [];
        const styles = result.styles || [];
        this.processPrompt(prompt, type, score, criteria, topics, entities, styles);
    }
};
