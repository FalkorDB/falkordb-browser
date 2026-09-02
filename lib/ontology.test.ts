import test from "node:test";
import assert from "node:assert/strict";
import { dataGraphName, isOntologyShape, ontologyDeclaredType, ontologyGraphName, ontologyPropertyType, ONTOLOGY_PROPERTY_TYPE_NAMES, withDeclaredTypes } from "./ontology.ts";

test("ontologyGraphName and dataGraphName are inverses", () => {
    assert.equal(ontologyGraphName("foo"), "foo__ontology");
    assert.equal(dataGraphName("foo__ontology"), "foo");
    assert.equal(dataGraphName(ontologyGraphName("foo__ontology")), "foo__ontology");
});

test("dataGraphName rejects names that only look like a suffix", () => {
    assert.equal(dataGraphName("foo"), undefined);
    assert.equal(dataGraphName("__ontology"), undefined);
    assert.equal(dataGraphName("foo_ontology"), undefined);
});

test("isOntologyShape accepts what the SDK writes", () => {
    assert.equal(isOntologyShape(["Entity", "Property", "Relation"], ["HAS_PROPERTY", "SOURCE", "TARGET"]), true);
    // An ontology with no relations declares no edges, and one with no
    // properties declares no HAS_PROPERTY.
    assert.equal(isOntologyShape(["Entity"], []), true);
});

test("isOntologyShape rejects a graph that only borrowed the name", () => {
    assert.equal(isOntologyShape(["Entity", "Person"], []), false);
    assert.equal(isOntologyShape(["Entity"], ["KNOWS"]), false);
    // An empty graph is empty, not an ontology: hiding it would lose it.
    assert.equal(isOntologyShape([], []), false);
});

test("withDeclaredTypes appends only the types the data has no instance of", () => {
    assert.deepEqual(
        withDeclaredTypes([["Person", 3]], ["Person", "Award"]),
        [["Person", 3], ["Award", 0]],
    );
});

test("withDeclaredTypes returns the stats untouched when nothing is declared", () => {
    const stats: [string, number][] = [["Person", 3]];
    assert.equal(withDeclaredTypes(stats, []), stats);
});

test("every type the editor offers is one the SDK stores", () => {
    ONTOLOGY_PROPERTY_TYPE_NAMES.forEach((name) => {
        assert.equal(ontologyPropertyType(ontologyDeclaredType(name)), name);
    });
});

test("a type the SDK never wrote survives being edited", () => {
    // Shown as it reads and written back as it was declared, so editing the
    // property next to it does not silently retype it.
    assert.equal(ontologyPropertyType("point"), "Point");
    assert.equal(ontologyDeclaredType("Point"), "POINT");
});

test("an unset type reads as the SDK's default", () => {
    assert.equal(ontologyPropertyType(undefined), "String");
    assert.equal(ontologyPropertyType(""), "String");
});
