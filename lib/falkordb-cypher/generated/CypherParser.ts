// Generated from Cypher.g4 by ANTLR 4.13.1

import * as antlr from "antlr4ng";
import type { Token } from "antlr4ng";

import { CypherListener } from "./CypherListener.ts";
// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;


export class CypherParser extends antlr.Parser {
    public static readonly T__0 = 1;
    public static readonly T__1 = 2;
    public static readonly T__2 = 3;
    public static readonly T__3 = 4;
    public static readonly T__4 = 5;
    public static readonly T__5 = 6;
    public static readonly T__6 = 7;
    public static readonly T__7 = 8;
    public static readonly T__8 = 9;
    public static readonly T__9 = 10;
    public static readonly T__10 = 11;
    public static readonly T__11 = 12;
    public static readonly T__12 = 13;
    public static readonly T__13 = 14;
    public static readonly T__14 = 15;
    public static readonly T__15 = 16;
    public static readonly T__16 = 17;
    public static readonly T__17 = 18;
    public static readonly T__18 = 19;
    public static readonly T__19 = 20;
    public static readonly T__20 = 21;
    public static readonly T__21 = 22;
    public static readonly T__22 = 23;
    public static readonly T__23 = 24;
    public static readonly T__24 = 25;
    public static readonly T__25 = 26;
    public static readonly T__26 = 27;
    public static readonly T__27 = 28;
    public static readonly T__28 = 29;
    public static readonly T__29 = 30;
    public static readonly T__30 = 31;
    public static readonly T__31 = 32;
    public static readonly T__32 = 33;
    public static readonly T__33 = 34;
    public static readonly T__34 = 35;
    public static readonly T__35 = 36;
    public static readonly T__36 = 37;
    public static readonly T__37 = 38;
    public static readonly T__38 = 39;
    public static readonly T__39 = 40;
    public static readonly T__40 = 41;
    public static readonly T__41 = 42;
    public static readonly T__42 = 43;
    public static readonly T__43 = 44;
    public static readonly T__44 = 45;
    public static readonly INDEX = 46;
    public static readonly ASSERT = 47;
    public static readonly FULLTEXT = 48;
    public static readonly VECTOR = 49;
    public static readonly OPTIONS = 50;
    public static readonly UNION = 51;
    public static readonly ALL = 52;
    public static readonly LOAD = 53;
    public static readonly CSV = 54;
    public static readonly HEADERS = 55;
    public static readonly FROM = 56;
    public static readonly FIELDTERMINATOR = 57;
    public static readonly FOREACH = 58;
    public static readonly OPTIONAL = 59;
    public static readonly MATCH = 60;
    public static readonly UNWIND = 61;
    public static readonly AS = 62;
    public static readonly MERGE = 63;
    public static readonly ON = 64;
    public static readonly CREATE = 65;
    public static readonly SET = 66;
    public static readonly DETACH = 67;
    public static readonly DELETE = 68;
    public static readonly REMOVE = 69;
    public static readonly CALL = 70;
    public static readonly YIELD = 71;
    public static readonly WITH = 72;
    public static readonly RETURN = 73;
    public static readonly DISTINCT = 74;
    public static readonly ORDER = 75;
    public static readonly BY = 76;
    public static readonly L_SKIP = 77;
    public static readonly LIMIT = 78;
    public static readonly ASCENDING = 79;
    public static readonly ASC = 80;
    public static readonly DESCENDING = 81;
    public static readonly DESC = 82;
    public static readonly WHERE = 83;
    public static readonly SHORTESTPATH = 84;
    public static readonly ALLSHORTESTPATHS = 85;
    public static readonly OR = 86;
    public static readonly XOR = 87;
    public static readonly AND = 88;
    public static readonly NOT = 89;
    public static readonly STARTS = 90;
    public static readonly ENDS = 91;
    public static readonly CONTAINS = 92;
    public static readonly IN = 93;
    public static readonly IS = 94;
    public static readonly NULL = 95;
    public static readonly COUNT = 96;
    public static readonly CASE = 97;
    public static readonly ELSE = 98;
    public static readonly END = 99;
    public static readonly WHEN = 100;
    public static readonly THEN = 101;
    public static readonly ANY = 102;
    public static readonly NONE = 103;
    public static readonly SINGLE = 104;
    public static readonly REDUCE = 105;
    public static readonly EXISTS = 106;
    public static readonly TRUE = 107;
    public static readonly FALSE = 108;
    public static readonly HexInteger = 109;
    public static readonly DecimalInteger = 110;
    public static readonly OctalInteger = 111;
    public static readonly HexLetter = 112;
    public static readonly HexDigit = 113;
    public static readonly Digit = 114;
    public static readonly NonZeroDigit = 115;
    public static readonly NonZeroOctDigit = 116;
    public static readonly OctDigit = 117;
    public static readonly ZeroDigit = 118;
    public static readonly ExponentDecimalReal = 119;
    public static readonly RegularDecimalReal = 120;
    public static readonly StringLiteral = 121;
    public static readonly EscapedChar = 122;
    public static readonly CONSTRAINT = 123;
    public static readonly DO = 124;
    public static readonly FOR = 125;
    public static readonly REQUIRE = 126;
    public static readonly UNIQUE = 127;
    public static readonly MANDATORY = 128;
    public static readonly SCALAR = 129;
    public static readonly OF = 130;
    public static readonly ADD = 131;
    public static readonly DROP = 132;
    public static readonly FILTER = 133;
    public static readonly EXTRACT = 134;
    public static readonly CYPHER = 135;
    public static readonly UnescapedSymbolicName = 136;
    public static readonly IdentifierStart = 137;
    public static readonly IdentifierPart = 138;
    public static readonly EscapedSymbolicName = 139;
    public static readonly SP = 140;
    public static readonly WHITESPACE = 141;
    public static readonly Comment = 142;
    public static readonly RULE_oC_Cypher = 0;
    public static readonly RULE_oC_Statement = 1;
    public static readonly RULE_oC_Query = 2;
    public static readonly RULE_oC_FalkorCommand = 3;
    public static readonly RULE_oC_CreateIndex = 4;
    public static readonly RULE_oC_DropIndex = 5;
    public static readonly RULE_oC_IndexQualifier = 6;
    public static readonly RULE_oC_IndexEntity = 7;
    public static readonly RULE_oC_IndexProperties = 8;
    public static readonly RULE_oC_CreateConstraint = 9;
    public static readonly RULE_oC_DropConstraint = 10;
    public static readonly RULE_oC_ConstraintPredicate = 11;
    public static readonly RULE_oC_RegularQuery = 12;
    public static readonly RULE_oC_Union = 13;
    public static readonly RULE_oC_SingleQuery = 14;
    public static readonly RULE_oC_SinglePartQuery = 15;
    public static readonly RULE_oC_MultiPartQuery = 16;
    public static readonly RULE_oC_UpdatingClause = 17;
    public static readonly RULE_oC_ReadingClause = 18;
    public static readonly RULE_oC_LoadCsv = 19;
    public static readonly RULE_oC_Foreach = 20;
    public static readonly RULE_oC_CallSubquery = 21;
    public static readonly RULE_oC_Match = 22;
    public static readonly RULE_oC_Unwind = 23;
    public static readonly RULE_oC_Merge = 24;
    public static readonly RULE_oC_MergeAction = 25;
    public static readonly RULE_oC_Create = 26;
    public static readonly RULE_oC_Set = 27;
    public static readonly RULE_oC_SetItem = 28;
    public static readonly RULE_oC_Delete = 29;
    public static readonly RULE_oC_Remove = 30;
    public static readonly RULE_oC_RemoveItem = 31;
    public static readonly RULE_oC_InQueryCall = 32;
    public static readonly RULE_oC_StandaloneCall = 33;
    public static readonly RULE_oC_YieldItems = 34;
    public static readonly RULE_oC_YieldItem = 35;
    public static readonly RULE_oC_With = 36;
    public static readonly RULE_oC_Return = 37;
    public static readonly RULE_oC_ProjectionBody = 38;
    public static readonly RULE_oC_ProjectionItems = 39;
    public static readonly RULE_oC_ProjectionItem = 40;
    public static readonly RULE_oC_MapProjection = 41;
    public static readonly RULE_oC_MapProjectionElement = 42;
    public static readonly RULE_oC_Order = 43;
    public static readonly RULE_oC_Skip = 44;
    public static readonly RULE_oC_Limit = 45;
    public static readonly RULE_oC_SortItem = 46;
    public static readonly RULE_oC_Where = 47;
    public static readonly RULE_oC_Pattern = 48;
    public static readonly RULE_oC_PatternPart = 49;
    public static readonly RULE_oC_AnonymousPatternPart = 50;
    public static readonly RULE_oC_ShortestPathPattern = 51;
    public static readonly RULE_oC_PatternElement = 52;
    public static readonly RULE_oC_RelationshipsPattern = 53;
    public static readonly RULE_oC_NodePattern = 54;
    public static readonly RULE_oC_PatternElementChain = 55;
    public static readonly RULE_oC_RelationshipPattern = 56;
    public static readonly RULE_oC_RelationshipDetail = 57;
    public static readonly RULE_oC_Properties = 58;
    public static readonly RULE_oC_RelationshipTypes = 59;
    public static readonly RULE_oC_NodeLabels = 60;
    public static readonly RULE_oC_NodeLabel = 61;
    public static readonly RULE_oC_RangeLiteral = 62;
    public static readonly RULE_oC_LabelName = 63;
    public static readonly RULE_oC_RelTypeName = 64;
    public static readonly RULE_oC_PropertyExpression = 65;
    public static readonly RULE_oC_Expression = 66;
    public static readonly RULE_oC_OrExpression = 67;
    public static readonly RULE_oC_XorExpression = 68;
    public static readonly RULE_oC_AndExpression = 69;
    public static readonly RULE_oC_NotExpression = 70;
    public static readonly RULE_oC_ComparisonExpression = 71;
    public static readonly RULE_oC_PartialComparisonExpression = 72;
    public static readonly RULE_oC_StringListNullPredicateExpression = 73;
    public static readonly RULE_oC_StringPredicateExpression = 74;
    public static readonly RULE_oC_ListPredicateExpression = 75;
    public static readonly RULE_oC_NullPredicateExpression = 76;
    public static readonly RULE_oC_AddOrSubtractExpression = 77;
    public static readonly RULE_oC_MultiplyDivideModuloExpression = 78;
    public static readonly RULE_oC_PowerOfExpression = 79;
    public static readonly RULE_oC_UnaryAddOrSubtractExpression = 80;
    public static readonly RULE_oC_NonArithmeticOperatorExpression = 81;
    public static readonly RULE_oC_ListOperatorExpression = 82;
    public static readonly RULE_oC_PropertyLookup = 83;
    public static readonly RULE_oC_Atom = 84;
    public static readonly RULE_oC_CaseExpression = 85;
    public static readonly RULE_oC_CaseAlternative = 86;
    public static readonly RULE_oC_ListComprehension = 87;
    public static readonly RULE_oC_PatternComprehension = 88;
    public static readonly RULE_oC_Quantifier = 89;
    public static readonly RULE_oC_FilterExpression = 90;
    public static readonly RULE_oC_PatternPredicate = 91;
    public static readonly RULE_oC_ParenthesizedExpression = 92;
    public static readonly RULE_oC_IdInColl = 93;
    public static readonly RULE_oC_ReduceExpression = 94;
    public static readonly RULE_oC_FunctionInvocation = 95;
    public static readonly RULE_oC_FunctionName = 96;
    public static readonly RULE_oC_ExistentialSubquery = 97;
    public static readonly RULE_oC_ExplicitProcedureInvocation = 98;
    public static readonly RULE_oC_ImplicitProcedureInvocation = 99;
    public static readonly RULE_oC_ProcedureResultField = 100;
    public static readonly RULE_oC_ProcedureName = 101;
    public static readonly RULE_oC_Namespace = 102;
    public static readonly RULE_oC_Variable = 103;
    public static readonly RULE_oC_Literal = 104;
    public static readonly RULE_oC_BooleanLiteral = 105;
    public static readonly RULE_oC_NumberLiteral = 106;
    public static readonly RULE_oC_IntegerLiteral = 107;
    public static readonly RULE_oC_DoubleLiteral = 108;
    public static readonly RULE_oC_ListLiteral = 109;
    public static readonly RULE_oC_MapLiteral = 110;
    public static readonly RULE_oC_PropertyKeyName = 111;
    public static readonly RULE_oC_Parameter = 112;
    public static readonly RULE_oC_SchemaName = 113;
    public static readonly RULE_oC_ReservedWord = 114;
    public static readonly RULE_oC_SymbolicName = 115;
    public static readonly RULE_oC_ParameterHeader = 116;
    public static readonly RULE_oC_LeftArrowHead = 117;
    public static readonly RULE_oC_RightArrowHead = 118;
    public static readonly RULE_oC_Dash = 119;

    public static readonly literalNames = [
        null, "';'", "':'", "'('", "','", "')'", "'|'", "'{'", "'}'", "'='",
        "'+='", "'*'", "'.'", "'['", "']'", "'..'", "'<>'", "'<'", "'>'",
        "'<='", "'>='", "'+'", "'-'", "'/'", "'%'", "'^'", "'$'", "'\\u27E8'",
        "'\\u3008'", "'\\uFE64'", "'\\uFF1C'", "'\\u27E9'", "'\\u3009'",
        "'\\uFE65'", "'\\uFF1E'", "'\\u00AD'", "'\\u2010'", "'\\u2011'",
        "'\\u2012'", "'\\u2013'", "'\\u2014'", "'\\u2015'", "'\\u2212'",
        "'\\uFE58'", "'\\uFE63'", "'\\uFF0D'", null, null, null, null, null,
        null, null, null, null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null, null, null, null,
        null, "'0'"
    ];

    public static readonly symbolicNames = [
        null, null, null, null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null, null, null, null,
        null, null, "INDEX", "ASSERT", "FULLTEXT", "VECTOR", "OPTIONS",
        "UNION", "ALL", "LOAD", "CSV", "HEADERS", "FROM", "FIELDTERMINATOR",
        "FOREACH", "OPTIONAL", "MATCH", "UNWIND", "AS", "MERGE", "ON", "CREATE",
        "SET", "DETACH", "DELETE", "REMOVE", "CALL", "YIELD", "WITH", "RETURN",
        "DISTINCT", "ORDER", "BY", "L_SKIP", "LIMIT", "ASCENDING", "ASC",
        "DESCENDING", "DESC", "WHERE", "SHORTESTPATH", "ALLSHORTESTPATHS",
        "OR", "XOR", "AND", "NOT", "STARTS", "ENDS", "CONTAINS", "IN", "IS",
        "NULL", "COUNT", "CASE", "ELSE", "END", "WHEN", "THEN", "ANY", "NONE",
        "SINGLE", "REDUCE", "EXISTS", "TRUE", "FALSE", "HexInteger", "DecimalInteger",
        "OctalInteger", "HexLetter", "HexDigit", "Digit", "NonZeroDigit",
        "NonZeroOctDigit", "OctDigit", "ZeroDigit", "ExponentDecimalReal",
        "RegularDecimalReal", "StringLiteral", "EscapedChar", "CONSTRAINT",
        "DO", "FOR", "REQUIRE", "UNIQUE", "MANDATORY", "SCALAR", "OF", "ADD",
        "DROP", "FILTER", "EXTRACT", "CYPHER", "UnescapedSymbolicName",
        "IdentifierStart", "IdentifierPart", "EscapedSymbolicName", "SP",
        "WHITESPACE", "Comment"
    ];
    public static readonly ruleNames = [
        "oC_Cypher", "oC_Statement", "oC_Query", "oC_FalkorCommand", "oC_CreateIndex",
        "oC_DropIndex", "oC_IndexQualifier", "oC_IndexEntity", "oC_IndexProperties",
        "oC_CreateConstraint", "oC_DropConstraint", "oC_ConstraintPredicate",
        "oC_RegularQuery", "oC_Union", "oC_SingleQuery", "oC_SinglePartQuery",
        "oC_MultiPartQuery", "oC_UpdatingClause", "oC_ReadingClause", "oC_LoadCsv",
        "oC_Foreach", "oC_CallSubquery", "oC_Match", "oC_Unwind", "oC_Merge",
        "oC_MergeAction", "oC_Create", "oC_Set", "oC_SetItem", "oC_Delete",
        "oC_Remove", "oC_RemoveItem", "oC_InQueryCall", "oC_StandaloneCall",
        "oC_YieldItems", "oC_YieldItem", "oC_With", "oC_Return", "oC_ProjectionBody",
        "oC_ProjectionItems", "oC_ProjectionItem", "oC_MapProjection", "oC_MapProjectionElement",
        "oC_Order", "oC_Skip", "oC_Limit", "oC_SortItem", "oC_Where", "oC_Pattern",
        "oC_PatternPart", "oC_AnonymousPatternPart", "oC_ShortestPathPattern",
        "oC_PatternElement", "oC_RelationshipsPattern", "oC_NodePattern",
        "oC_PatternElementChain", "oC_RelationshipPattern", "oC_RelationshipDetail",
        "oC_Properties", "oC_RelationshipTypes", "oC_NodeLabels", "oC_NodeLabel",
        "oC_RangeLiteral", "oC_LabelName", "oC_RelTypeName", "oC_PropertyExpression",
        "oC_Expression", "oC_OrExpression", "oC_XorExpression", "oC_AndExpression",
        "oC_NotExpression", "oC_ComparisonExpression", "oC_PartialComparisonExpression",
        "oC_StringListNullPredicateExpression", "oC_StringPredicateExpression",
        "oC_ListPredicateExpression", "oC_NullPredicateExpression", "oC_AddOrSubtractExpression",
        "oC_MultiplyDivideModuloExpression", "oC_PowerOfExpression", "oC_UnaryAddOrSubtractExpression",
        "oC_NonArithmeticOperatorExpression", "oC_ListOperatorExpression",
        "oC_PropertyLookup", "oC_Atom", "oC_CaseExpression", "oC_CaseAlternative",
        "oC_ListComprehension", "oC_PatternComprehension", "oC_Quantifier",
        "oC_FilterExpression", "oC_PatternPredicate", "oC_ParenthesizedExpression",
        "oC_IdInColl", "oC_ReduceExpression", "oC_FunctionInvocation", "oC_FunctionName",
        "oC_ExistentialSubquery", "oC_ExplicitProcedureInvocation", "oC_ImplicitProcedureInvocation",
        "oC_ProcedureResultField", "oC_ProcedureName", "oC_Namespace", "oC_Variable",
        "oC_Literal", "oC_BooleanLiteral", "oC_NumberLiteral", "oC_IntegerLiteral",
        "oC_DoubleLiteral", "oC_ListLiteral", "oC_MapLiteral", "oC_PropertyKeyName",
        "oC_Parameter", "oC_SchemaName", "oC_ReservedWord", "oC_SymbolicName",
        "oC_ParameterHeader", "oC_LeftArrowHead", "oC_RightArrowHead", "oC_Dash",
    ];

    public get grammarFileName(): string { return "Cypher.g4"; }
    public get literalNames(): (string | null)[] { return CypherParser.literalNames; }
    public get symbolicNames(): (string | null)[] { return CypherParser.symbolicNames; }
    public get ruleNames(): string[] { return CypherParser.ruleNames; }
    public get serializedATN(): number[] { return CypherParser._serializedATN; }

    protected createFailedPredicateException(predicate?: string, message?: string): antlr.FailedPredicateException {
        return new antlr.FailedPredicateException(this, predicate, message);
    }

    public constructor(input: antlr.TokenStream) {
        super(input);
        this.interpreter = new antlr.ParserATNSimulator(this, CypherParser._ATN, CypherParser.decisionsToDFA, new antlr.PredictionContextCache());
    }
    public oC_Cypher(): OC_CypherContext {
        let localContext = new OC_CypherContext(this.context, this.state);
        this.enterRule(localContext, 0, CypherParser.RULE_oC_Cypher);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 241;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 240;
                this.match(CypherParser.SP);
                }
            }

            this.state = 255;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 135) {
                {
                this.state = 243;
                this.match(CypherParser.CYPHER);
                this.state = 244;
                this.match(CypherParser.SP);
                this.state = 245;
                this.oC_ParameterHeader();
                this.state = 250;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 1, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 246;
                        this.match(CypherParser.SP);
                        this.state = 247;
                        this.oC_ParameterHeader();
                        }
                        }
                    }
                    this.state = 252;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 1, this.context);
                }
                this.state = 253;
                this.match(CypherParser.SP);
                }
            }

            this.state = 257;
            this.oC_Statement();
            this.state = 262;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 4, this.context) ) {
            case 1:
                {
                this.state = 259;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 258;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 261;
                this.match(CypherParser.T__0);
                }
                break;
            }
            this.state = 265;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 264;
                this.match(CypherParser.SP);
                }
            }

            this.state = 267;
            this.match(CypherParser.EOF);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_Statement(): OC_StatementContext {
        let localContext = new OC_StatementContext(this.context, this.state);
        this.enterRule(localContext, 2, CypherParser.RULE_oC_Statement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 269;
            this.oC_Query();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_Query(): OC_QueryContext {
        let localContext = new OC_QueryContext(this.context, this.state);
        this.enterRule(localContext, 4, CypherParser.RULE_oC_Query);
        try {
            this.state = 274;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 6, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 271;
                this.oC_RegularQuery();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 272;
                this.oC_StandaloneCall();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 273;
                this.oC_FalkorCommand();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_FalkorCommand(): OC_FalkorCommandContext {
        let localContext = new OC_FalkorCommandContext(this.context, this.state);
        this.enterRule(localContext, 6, CypherParser.RULE_oC_FalkorCommand);
        try {
            this.state = 280;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 7, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 276;
                this.oC_CreateIndex();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 277;
                this.oC_DropIndex();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 278;
                this.oC_CreateConstraint();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 279;
                this.oC_DropConstraint();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_CreateIndex(): OC_CreateIndexContext {
        let localContext = new OC_CreateIndexContext(this.context, this.state);
        this.enterRule(localContext, 8, CypherParser.RULE_oC_CreateIndex);
        let _la: number;
        try {
            this.state = 353;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 23, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 282;
                this.match(CypherParser.CREATE);
                this.state = 283;
                this.match(CypherParser.SP);
                this.state = 284;
                this.oC_IndexQualifier();
                this.state = 285;
                this.match(CypherParser.SP);
                this.state = 286;
                this.match(CypherParser.INDEX);
                this.state = 288;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 287;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 290;
                this.match(CypherParser.FOR);
                this.state = 292;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 291;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 294;
                this.oC_IndexEntity();
                this.state = 296;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 295;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 298;
                this.match(CypherParser.ON);
                this.state = 300;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 299;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 302;
                this.oC_IndexProperties();
                this.state = 311;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 14, this.context) ) {
                case 1:
                    {
                    this.state = 304;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 303;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 306;
                    this.match(CypherParser.OPTIONS);
                    this.state = 308;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 307;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 310;
                    this.oC_MapLiteral();
                    }
                    break;
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 313;
                this.match(CypherParser.CREATE);
                this.state = 314;
                this.match(CypherParser.SP);
                this.state = 315;
                this.match(CypherParser.INDEX);
                this.state = 317;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 316;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 319;
                this.match(CypherParser.FOR);
                this.state = 321;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 320;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 323;
                this.oC_IndexEntity();
                this.state = 325;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 324;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 327;
                this.match(CypherParser.ON);
                this.state = 329;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 328;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 331;
                this.oC_IndexProperties();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 333;
                this.match(CypherParser.CREATE);
                this.state = 334;
                this.match(CypherParser.SP);
                this.state = 335;
                this.match(CypherParser.INDEX);
                this.state = 337;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 336;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 339;
                this.match(CypherParser.ON);
                this.state = 341;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 340;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 343;
                this.match(CypherParser.T__1);
                this.state = 345;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 344;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 347;
                this.oC_LabelName();
                this.state = 349;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 348;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 351;
                this.oC_IndexProperties();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_DropIndex(): OC_DropIndexContext {
        let localContext = new OC_DropIndexContext(this.context, this.state);
        this.enterRule(localContext, 10, CypherParser.RULE_oC_DropIndex);
        let _la: number;
        try {
            this.state = 417;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 36, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 355;
                this.match(CypherParser.DROP);
                this.state = 356;
                this.match(CypherParser.SP);
                this.state = 357;
                this.oC_IndexQualifier();
                this.state = 358;
                this.match(CypherParser.SP);
                this.state = 359;
                this.match(CypherParser.INDEX);
                this.state = 361;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 360;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 363;
                this.match(CypherParser.FOR);
                this.state = 365;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 364;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 367;
                this.oC_IndexEntity();
                this.state = 369;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 368;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 371;
                this.match(CypherParser.ON);
                this.state = 373;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 372;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 375;
                this.oC_IndexProperties();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 377;
                this.match(CypherParser.DROP);
                this.state = 378;
                this.match(CypherParser.SP);
                this.state = 379;
                this.match(CypherParser.INDEX);
                this.state = 381;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 380;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 383;
                this.match(CypherParser.FOR);
                this.state = 385;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 384;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 387;
                this.oC_IndexEntity();
                this.state = 389;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 388;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 391;
                this.match(CypherParser.ON);
                this.state = 393;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 392;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 395;
                this.oC_IndexProperties();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 397;
                this.match(CypherParser.DROP);
                this.state = 398;
                this.match(CypherParser.SP);
                this.state = 399;
                this.match(CypherParser.INDEX);
                this.state = 401;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 400;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 403;
                this.match(CypherParser.ON);
                this.state = 405;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 404;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 407;
                this.match(CypherParser.T__1);
                this.state = 409;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 408;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 411;
                this.oC_LabelName();
                this.state = 413;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 412;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 415;
                this.oC_IndexProperties();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_IndexQualifier(): OC_IndexQualifierContext {
        let localContext = new OC_IndexQualifierContext(this.context, this.state);
        this.enterRule(localContext, 12, CypherParser.RULE_oC_IndexQualifier);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 419;
            _la = this.tokenStream.LA(1);
            if(!(_la === 48 || _la === 49)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_IndexEntity(): OC_IndexEntityContext {
        let localContext = new OC_IndexEntityContext(this.context, this.state);
        this.enterRule(localContext, 14, CypherParser.RULE_oC_IndexEntity);
        try {
            this.state = 423;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 37, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 421;
                this.oC_NodePattern();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 422;
                this.oC_RelationshipsPattern();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_IndexProperties(): OC_IndexPropertiesContext {
        let localContext = new OC_IndexPropertiesContext(this.context, this.state);
        this.enterRule(localContext, 16, CypherParser.RULE_oC_IndexProperties);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 425;
            this.match(CypherParser.T__2);
            this.state = 427;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 426;
                this.match(CypherParser.SP);
                }
            }

            this.state = 429;
            this.oC_Expression();
            this.state = 440;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 41, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 431;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 430;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 433;
                    this.match(CypherParser.T__3);
                    this.state = 435;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 434;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 437;
                    this.oC_Expression();
                    }
                    }
                }
                this.state = 442;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 41, this.context);
            }
            this.state = 444;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 443;
                this.match(CypherParser.SP);
                }
            }

            this.state = 446;
            this.match(CypherParser.T__4);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_CreateConstraint(): OC_CreateConstraintContext {
        let localContext = new OC_CreateConstraintContext(this.context, this.state);
        this.enterRule(localContext, 18, CypherParser.RULE_oC_CreateConstraint);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 448;
            this.match(CypherParser.CREATE);
            this.state = 449;
            this.match(CypherParser.SP);
            this.state = 450;
            this.match(CypherParser.CONSTRAINT);
            this.state = 451;
            this.match(CypherParser.SP);
            this.state = 452;
            this.match(CypherParser.ON);
            this.state = 454;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 453;
                this.match(CypherParser.SP);
                }
            }

            this.state = 456;
            this.oC_IndexEntity();
            this.state = 457;
            this.match(CypherParser.SP);
            this.state = 458;
            this.match(CypherParser.ASSERT);
            this.state = 459;
            this.match(CypherParser.SP);
            this.state = 460;
            this.oC_Expression();
            this.state = 471;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 46, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 462;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 461;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 464;
                    this.match(CypherParser.T__3);
                    this.state = 466;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 465;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 468;
                    this.oC_Expression();
                    }
                    }
                }
                this.state = 473;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 46, this.context);
            }
            this.state = 476;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 47, this.context) ) {
            case 1:
                {
                this.state = 474;
                this.match(CypherParser.SP);
                this.state = 475;
                this.oC_ConstraintPredicate();
                }
                break;
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_DropConstraint(): OC_DropConstraintContext {
        let localContext = new OC_DropConstraintContext(this.context, this.state);
        this.enterRule(localContext, 20, CypherParser.RULE_oC_DropConstraint);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 478;
            this.match(CypherParser.DROP);
            this.state = 479;
            this.match(CypherParser.SP);
            this.state = 480;
            this.match(CypherParser.CONSTRAINT);
            this.state = 481;
            this.match(CypherParser.SP);
            this.state = 482;
            this.match(CypherParser.ON);
            this.state = 484;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 483;
                this.match(CypherParser.SP);
                }
            }

            this.state = 486;
            this.oC_IndexEntity();
            this.state = 487;
            this.match(CypherParser.SP);
            this.state = 488;
            this.match(CypherParser.ASSERT);
            this.state = 489;
            this.match(CypherParser.SP);
            this.state = 490;
            this.oC_Expression();
            this.state = 501;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 51, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 492;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 491;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 494;
                    this.match(CypherParser.T__3);
                    this.state = 496;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 495;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 498;
                    this.oC_Expression();
                    }
                    }
                }
                this.state = 503;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 51, this.context);
            }
            this.state = 506;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 52, this.context) ) {
            case 1:
                {
                this.state = 504;
                this.match(CypherParser.SP);
                this.state = 505;
                this.oC_ConstraintPredicate();
                }
                break;
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_ConstraintPredicate(): OC_ConstraintPredicateContext {
        let localContext = new OC_ConstraintPredicateContext(this.context, this.state);
        this.enterRule(localContext, 22, CypherParser.RULE_oC_ConstraintPredicate);
        try {
            this.state = 516;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 53, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 508;
                this.match(CypherParser.IS);
                this.state = 509;
                this.match(CypherParser.SP);
                this.state = 510;
                this.match(CypherParser.UNIQUE);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 511;
                this.match(CypherParser.IS);
                this.state = 512;
                this.match(CypherParser.SP);
                this.state = 513;
                this.match(CypherParser.NOT);
                this.state = 514;
                this.match(CypherParser.SP);
                this.state = 515;
                this.match(CypherParser.NULL);
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_RegularQuery(): OC_RegularQueryContext {
        let localContext = new OC_RegularQueryContext(this.context, this.state);
        this.enterRule(localContext, 24, CypherParser.RULE_oC_RegularQuery);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 518;
            this.oC_SingleQuery();
            this.state = 525;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 55, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 520;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 519;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 522;
                    this.oC_Union();
                    }
                    }
                }
                this.state = 527;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 55, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_Union(): OC_UnionContext {
        let localContext = new OC_UnionContext(this.context, this.state);
        this.enterRule(localContext, 26, CypherParser.RULE_oC_Union);
        let _la: number;
        try {
            this.state = 540;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 58, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 528;
                this.match(CypherParser.UNION);
                this.state = 529;
                this.match(CypherParser.SP);
                this.state = 530;
                this.match(CypherParser.ALL);
                this.state = 532;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 531;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 534;
                this.oC_SingleQuery();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 535;
                this.match(CypherParser.UNION);
                this.state = 537;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 536;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 539;
                this.oC_SingleQuery();
                }
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_SingleQuery(): OC_SingleQueryContext {
        let localContext = new OC_SingleQueryContext(this.context, this.state);
        this.enterRule(localContext, 28, CypherParser.RULE_oC_SingleQuery);
        try {
            this.state = 544;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 59, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 542;
                this.oC_SinglePartQuery();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 543;
                this.oC_MultiPartQuery();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_SinglePartQuery(): OC_SinglePartQueryContext {
        let localContext = new OC_SinglePartQueryContext(this.context, this.state);
        this.enterRule(localContext, 30, CypherParser.RULE_oC_SinglePartQuery);
        let _la: number;
        try {
            let alternative: number;
            this.state = 581;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 68, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 552;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (((((_la - 53)) & ~0x1F) === 0 && ((1 << (_la - 53)) & 131521) !== 0)) {
                    {
                    {
                    this.state = 546;
                    this.oC_ReadingClause();
                    this.state = 548;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 547;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 554;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 555;
                this.oC_Return();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 562;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 63, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 556;
                        this.oC_ReadingClause();
                        this.state = 558;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 557;
                            this.match(CypherParser.SP);
                            }
                        }

                        }
                        }
                    }
                    this.state = 564;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 63, this.context);
                }
                this.state = 565;
                this.oC_UpdatingClause();
                this.state = 572;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 65, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 567;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 566;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 569;
                        this.oC_UpdatingClause();
                        }
                        }
                    }
                    this.state = 574;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 65, this.context);
                }
                this.state = 579;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 67, this.context) ) {
                case 1:
                    {
                    this.state = 576;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 575;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 578;
                    this.oC_Return();
                    }
                    break;
                }
                }
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_MultiPartQuery(): OC_MultiPartQueryContext {
        let localContext = new OC_MultiPartQueryContext(this.context, this.state);
        this.enterRule(localContext, 32, CypherParser.RULE_oC_MultiPartQuery);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 605;
            this.errorHandler.sync(this);
            alternative = 1;
            do {
                switch (alternative) {
                case 1:
                    {
                    {
                    this.state = 589;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 70, this.context);
                    while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                        if (alternative === 1) {
                            {
                            {
                            this.state = 583;
                            this.oC_ReadingClause();
                            this.state = 585;
                            this.errorHandler.sync(this);
                            _la = this.tokenStream.LA(1);
                            if (_la === 140) {
                                {
                                this.state = 584;
                                this.match(CypherParser.SP);
                                }
                            }

                            }
                            }
                        }
                        this.state = 591;
                        this.errorHandler.sync(this);
                        alternative = this.interpreter.adaptivePredict(this.tokenStream, 70, this.context);
                    }
                    this.state = 598;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    while (((((_la - 58)) & ~0x1F) === 0 && ((1 << (_la - 58)) & 8097) !== 0)) {
                        {
                        {
                        this.state = 592;
                        this.oC_UpdatingClause();
                        this.state = 594;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 593;
                            this.match(CypherParser.SP);
                            }
                        }

                        }
                        }
                        this.state = 600;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                    }
                    this.state = 601;
                    this.oC_With();
                    this.state = 603;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 602;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 607;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 74, this.context);
            } while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER);
            this.state = 609;
            this.oC_SinglePartQuery();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_UpdatingClause(): OC_UpdatingClauseContext {
        let localContext = new OC_UpdatingClauseContext(this.context, this.state);
        this.enterRule(localContext, 34, CypherParser.RULE_oC_UpdatingClause);
        try {
            this.state = 618;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.CREATE:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 611;
                this.oC_Create();
                }
                break;
            case CypherParser.MERGE:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 612;
                this.oC_Merge();
                }
                break;
            case CypherParser.DETACH:
            case CypherParser.DELETE:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 613;
                this.oC_Delete();
                }
                break;
            case CypherParser.SET:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 614;
                this.oC_Set();
                }
                break;
            case CypherParser.REMOVE:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 615;
                this.oC_Remove();
                }
                break;
            case CypherParser.FOREACH:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 616;
                this.oC_Foreach();
                }
                break;
            case CypherParser.CALL:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 617;
                this.oC_CallSubquery();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_ReadingClause(): OC_ReadingClauseContext {
        let localContext = new OC_ReadingClauseContext(this.context, this.state);
        this.enterRule(localContext, 36, CypherParser.RULE_oC_ReadingClause);
        try {
            this.state = 625;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 76, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 620;
                this.oC_Match();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 621;
                this.oC_Unwind();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 622;
                this.oC_InQueryCall();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 623;
                this.oC_CallSubquery();
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 624;
                this.oC_LoadCsv();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_LoadCsv(): OC_LoadCsvContext {
        let localContext = new OC_LoadCsvContext(this.context, this.state);
        this.enterRule(localContext, 38, CypherParser.RULE_oC_LoadCsv);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 627;
            this.match(CypherParser.LOAD);
            this.state = 628;
            this.match(CypherParser.SP);
            this.state = 629;
            this.match(CypherParser.CSV);
            this.state = 634;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 77, this.context) ) {
            case 1:
                {
                this.state = 630;
                this.match(CypherParser.SP);
                this.state = 631;
                this.match(CypherParser.WITH);
                this.state = 632;
                this.match(CypherParser.SP);
                this.state = 633;
                this.match(CypherParser.HEADERS);
                }
                break;
            }
            this.state = 636;
            this.match(CypherParser.SP);
            this.state = 637;
            this.match(CypherParser.FROM);
            this.state = 638;
            this.match(CypherParser.SP);
            this.state = 639;
            this.oC_Expression();
            this.state = 640;
            this.match(CypherParser.SP);
            this.state = 641;
            this.match(CypherParser.AS);
            this.state = 642;
            this.match(CypherParser.SP);
            this.state = 643;
            this.oC_Variable();
            this.state = 648;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 78, this.context) ) {
            case 1:
                {
                this.state = 644;
                this.match(CypherParser.SP);
                this.state = 645;
                this.match(CypherParser.FIELDTERMINATOR);
                this.state = 646;
                this.match(CypherParser.SP);
                this.state = 647;
                this.match(CypherParser.StringLiteral);
                }
                break;
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_Foreach(): OC_ForeachContext {
        let localContext = new OC_ForeachContext(this.context, this.state);
        this.enterRule(localContext, 40, CypherParser.RULE_oC_Foreach);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 650;
            this.match(CypherParser.FOREACH);
            this.state = 652;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 651;
                this.match(CypherParser.SP);
                }
            }

            this.state = 654;
            this.match(CypherParser.T__2);
            this.state = 656;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 655;
                this.match(CypherParser.SP);
                }
            }

            this.state = 658;
            this.oC_Variable();
            this.state = 659;
            this.match(CypherParser.SP);
            this.state = 660;
            this.match(CypherParser.IN);
            this.state = 661;
            this.match(CypherParser.SP);
            this.state = 662;
            this.oC_Expression();
            this.state = 664;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 663;
                this.match(CypherParser.SP);
                }
            }

            this.state = 666;
            this.match(CypherParser.T__5);
            this.state = 671;
            this.errorHandler.sync(this);
            alternative = 1;
            do {
                switch (alternative) {
                case 1:
                    {
                    {
                    this.state = 668;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 667;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 670;
                    this.oC_UpdatingClause();
                    }
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 673;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 83, this.context);
            } while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER);
            this.state = 676;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 675;
                this.match(CypherParser.SP);
                }
            }

            this.state = 678;
            this.match(CypherParser.T__4);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_CallSubquery(): OC_CallSubqueryContext {
        let localContext = new OC_CallSubqueryContext(this.context, this.state);
        this.enterRule(localContext, 42, CypherParser.RULE_oC_CallSubquery);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 680;
            this.match(CypherParser.CALL);
            this.state = 682;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 681;
                this.match(CypherParser.SP);
                }
            }

            this.state = 684;
            this.match(CypherParser.T__6);
            this.state = 686;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 685;
                this.match(CypherParser.SP);
                }
            }

            this.state = 688;
            this.oC_RegularQuery();
            this.state = 690;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 689;
                this.match(CypherParser.SP);
                }
            }

            this.state = 692;
            this.match(CypherParser.T__7);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_Match(): OC_MatchContext {
        let localContext = new OC_MatchContext(this.context, this.state);
        this.enterRule(localContext, 44, CypherParser.RULE_oC_Match);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 696;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 59) {
                {
                this.state = 694;
                this.match(CypherParser.OPTIONAL);
                this.state = 695;
                this.match(CypherParser.SP);
                }
            }

            this.state = 698;
            this.match(CypherParser.MATCH);
            this.state = 700;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 699;
                this.match(CypherParser.SP);
                }
            }

            this.state = 702;
            this.oC_Pattern();
            this.state = 707;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 91, this.context) ) {
            case 1:
                {
                this.state = 704;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 703;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 706;
                this.oC_Where();
                }
                break;
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_Unwind(): OC_UnwindContext {
        let localContext = new OC_UnwindContext(this.context, this.state);
        this.enterRule(localContext, 46, CypherParser.RULE_oC_Unwind);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 709;
            this.match(CypherParser.UNWIND);
            this.state = 711;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 710;
                this.match(CypherParser.SP);
                }
            }

            this.state = 713;
            this.oC_Expression();
            this.state = 714;
            this.match(CypherParser.SP);
            this.state = 715;
            this.match(CypherParser.AS);
            this.state = 716;
            this.match(CypherParser.SP);
            this.state = 717;
            this.oC_Variable();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_Merge(): OC_MergeContext {
        let localContext = new OC_MergeContext(this.context, this.state);
        this.enterRule(localContext, 48, CypherParser.RULE_oC_Merge);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 719;
            this.match(CypherParser.MERGE);
            this.state = 721;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 720;
                this.match(CypherParser.SP);
                }
            }

            this.state = 723;
            this.oC_PatternPart();
            this.state = 728;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 94, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 724;
                    this.match(CypherParser.SP);
                    this.state = 725;
                    this.oC_MergeAction();
                    }
                    }
                }
                this.state = 730;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 94, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_MergeAction(): OC_MergeActionContext {
        let localContext = new OC_MergeActionContext(this.context, this.state);
        this.enterRule(localContext, 50, CypherParser.RULE_oC_MergeAction);
        try {
            this.state = 741;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 95, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 731;
                this.match(CypherParser.ON);
                this.state = 732;
                this.match(CypherParser.SP);
                this.state = 733;
                this.match(CypherParser.MATCH);
                this.state = 734;
                this.match(CypherParser.SP);
                this.state = 735;
                this.oC_Set();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 736;
                this.match(CypherParser.ON);
                this.state = 737;
                this.match(CypherParser.SP);
                this.state = 738;
                this.match(CypherParser.CREATE);
                this.state = 739;
                this.match(CypherParser.SP);
                this.state = 740;
                this.oC_Set();
                }
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_Create(): OC_CreateContext {
        let localContext = new OC_CreateContext(this.context, this.state);
        this.enterRule(localContext, 52, CypherParser.RULE_oC_Create);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 743;
            this.match(CypherParser.CREATE);
            this.state = 745;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 744;
                this.match(CypherParser.SP);
                }
            }

            this.state = 747;
            this.oC_Pattern();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_Set(): OC_SetContext {
        let localContext = new OC_SetContext(this.context, this.state);
        this.enterRule(localContext, 54, CypherParser.RULE_oC_Set);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 749;
            this.match(CypherParser.SET);
            this.state = 751;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 750;
                this.match(CypherParser.SP);
                }
            }

            this.state = 753;
            this.oC_SetItem();
            this.state = 764;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 100, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 755;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 754;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 757;
                    this.match(CypherParser.T__3);
                    this.state = 759;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 758;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 761;
                    this.oC_SetItem();
                    }
                    }
                }
                this.state = 766;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 100, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_SetItem(): OC_SetItemContext {
        let localContext = new OC_SetItemContext(this.context, this.state);
        this.enterRule(localContext, 56, CypherParser.RULE_oC_SetItem);
        let _la: number;
        try {
            this.state = 803;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 108, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 767;
                this.oC_PropertyExpression();
                this.state = 769;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 768;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 771;
                this.match(CypherParser.T__8);
                this.state = 773;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 772;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 775;
                this.oC_Expression();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 777;
                this.oC_Variable();
                this.state = 779;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 778;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 781;
                this.match(CypherParser.T__8);
                this.state = 783;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 782;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 785;
                this.oC_Expression();
                }
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                {
                this.state = 787;
                this.oC_Variable();
                this.state = 789;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 788;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 791;
                this.match(CypherParser.T__9);
                this.state = 793;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 792;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 795;
                this.oC_Expression();
                }
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 797;
                this.oC_Variable();
                this.state = 799;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 798;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 801;
                this.oC_NodeLabels();
                }
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_Delete(): OC_DeleteContext {
        let localContext = new OC_DeleteContext(this.context, this.state);
        this.enterRule(localContext, 58, CypherParser.RULE_oC_Delete);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 807;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 67) {
                {
                this.state = 805;
                this.match(CypherParser.DETACH);
                this.state = 806;
                this.match(CypherParser.SP);
                }
            }

            this.state = 809;
            this.match(CypherParser.DELETE);
            this.state = 811;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 810;
                this.match(CypherParser.SP);
                }
            }

            this.state = 813;
            this.oC_Expression();
            this.state = 824;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 113, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 815;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 814;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 817;
                    this.match(CypherParser.T__3);
                    this.state = 819;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 818;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 821;
                    this.oC_Expression();
                    }
                    }
                }
                this.state = 826;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 113, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_Remove(): OC_RemoveContext {
        let localContext = new OC_RemoveContext(this.context, this.state);
        this.enterRule(localContext, 60, CypherParser.RULE_oC_Remove);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 827;
            this.match(CypherParser.REMOVE);
            this.state = 828;
            this.match(CypherParser.SP);
            this.state = 829;
            this.oC_RemoveItem();
            this.state = 840;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 116, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 831;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 830;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 833;
                    this.match(CypherParser.T__3);
                    this.state = 835;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 834;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 837;
                    this.oC_RemoveItem();
                    }
                    }
                }
                this.state = 842;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 116, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_RemoveItem(): OC_RemoveItemContext {
        let localContext = new OC_RemoveItemContext(this.context, this.state);
        this.enterRule(localContext, 62, CypherParser.RULE_oC_RemoveItem);
        try {
            this.state = 847;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 117, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 843;
                this.oC_Variable();
                this.state = 844;
                this.oC_NodeLabels();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 846;
                this.oC_PropertyExpression();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_InQueryCall(): OC_InQueryCallContext {
        let localContext = new OC_InQueryCallContext(this.context, this.state);
        this.enterRule(localContext, 64, CypherParser.RULE_oC_InQueryCall);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 849;
            this.match(CypherParser.CALL);
            this.state = 850;
            this.match(CypherParser.SP);
            this.state = 851;
            this.oC_ExplicitProcedureInvocation();
            this.state = 858;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 119, this.context) ) {
            case 1:
                {
                this.state = 853;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 852;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 855;
                this.match(CypherParser.YIELD);
                this.state = 856;
                this.match(CypherParser.SP);
                this.state = 857;
                this.oC_YieldItems();
                }
                break;
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_StandaloneCall(): OC_StandaloneCallContext {
        let localContext = new OC_StandaloneCallContext(this.context, this.state);
        this.enterRule(localContext, 66, CypherParser.RULE_oC_StandaloneCall);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 860;
            this.match(CypherParser.CALL);
            this.state = 861;
            this.match(CypherParser.SP);
            this.state = 864;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 120, this.context) ) {
            case 1:
                {
                this.state = 862;
                this.oC_ExplicitProcedureInvocation();
                }
                break;
            case 2:
                {
                this.state = 863;
                this.oC_ImplicitProcedureInvocation();
                }
                break;
            }
            this.state = 875;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 123, this.context) ) {
            case 1:
                {
                this.state = 867;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 866;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 869;
                this.match(CypherParser.YIELD);
                this.state = 870;
                this.match(CypherParser.SP);
                this.state = 873;
                this.errorHandler.sync(this);
                switch (this.tokenStream.LA(1)) {
                case CypherParser.T__10:
                    {
                    this.state = 871;
                    this.match(CypherParser.T__10);
                    }
                    break;
                case CypherParser.INDEX:
                case CypherParser.ASSERT:
                case CypherParser.FULLTEXT:
                case CypherParser.VECTOR:
                case CypherParser.OPTIONS:
                case CypherParser.LOAD:
                case CypherParser.CSV:
                case CypherParser.HEADERS:
                case CypherParser.FROM:
                case CypherParser.FIELDTERMINATOR:
                case CypherParser.REMOVE:
                case CypherParser.CALL:
                case CypherParser.YIELD:
                case CypherParser.SHORTESTPATH:
                case CypherParser.ALLSHORTESTPATHS:
                case CypherParser.COUNT:
                case CypherParser.ANY:
                case CypherParser.NONE:
                case CypherParser.SINGLE:
                case CypherParser.REDUCE:
                case CypherParser.EXISTS:
                case CypherParser.HexLetter:
                case CypherParser.DROP:
                case CypherParser.FILTER:
                case CypherParser.EXTRACT:
                case CypherParser.CYPHER:
                case CypherParser.UnescapedSymbolicName:
                case CypherParser.EscapedSymbolicName:
                    {
                    this.state = 872;
                    this.oC_YieldItems();
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                }
                break;
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_YieldItems(): OC_YieldItemsContext {
        let localContext = new OC_YieldItemsContext(this.context, this.state);
        this.enterRule(localContext, 68, CypherParser.RULE_oC_YieldItems);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 877;
            this.oC_YieldItem();
            this.state = 888;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 126, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 879;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 878;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 881;
                    this.match(CypherParser.T__3);
                    this.state = 883;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 882;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 885;
                    this.oC_YieldItem();
                    }
                    }
                }
                this.state = 890;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 126, this.context);
            }
            this.state = 895;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 128, this.context) ) {
            case 1:
                {
                this.state = 892;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 891;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 894;
                this.oC_Where();
                }
                break;
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_YieldItem(): OC_YieldItemContext {
        let localContext = new OC_YieldItemContext(this.context, this.state);
        this.enterRule(localContext, 70, CypherParser.RULE_oC_YieldItem);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 902;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 129, this.context) ) {
            case 1:
                {
                this.state = 897;
                this.oC_ProcedureResultField();
                this.state = 898;
                this.match(CypherParser.SP);
                this.state = 899;
                this.match(CypherParser.AS);
                this.state = 900;
                this.match(CypherParser.SP);
                }
                break;
            }
            this.state = 904;
            this.oC_Variable();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_With(): OC_WithContext {
        let localContext = new OC_WithContext(this.context, this.state);
        this.enterRule(localContext, 72, CypherParser.RULE_oC_With);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 906;
            this.match(CypherParser.WITH);
            this.state = 907;
            this.oC_ProjectionBody();
            this.state = 912;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 131, this.context) ) {
            case 1:
                {
                this.state = 909;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 908;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 911;
                this.oC_Where();
                }
                break;
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_Return(): OC_ReturnContext {
        let localContext = new OC_ReturnContext(this.context, this.state);
        this.enterRule(localContext, 74, CypherParser.RULE_oC_Return);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 914;
            this.match(CypherParser.RETURN);
            this.state = 915;
            this.oC_ProjectionBody();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_ProjectionBody(): OC_ProjectionBodyContext {
        let localContext = new OC_ProjectionBodyContext(this.context, this.state);
        this.enterRule(localContext, 76, CypherParser.RULE_oC_ProjectionBody);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 921;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 133, this.context) ) {
            case 1:
                {
                this.state = 918;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 917;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 920;
                this.match(CypherParser.DISTINCT);
                }
                break;
            }
            this.state = 923;
            this.match(CypherParser.SP);
            this.state = 924;
            this.oC_ProjectionItems();
            this.state = 927;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 134, this.context) ) {
            case 1:
                {
                this.state = 925;
                this.match(CypherParser.SP);
                this.state = 926;
                this.oC_Order();
                }
                break;
            }
            this.state = 931;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 135, this.context) ) {
            case 1:
                {
                this.state = 929;
                this.match(CypherParser.SP);
                this.state = 930;
                this.oC_Skip();
                }
                break;
            }
            this.state = 935;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 136, this.context) ) {
            case 1:
                {
                this.state = 933;
                this.match(CypherParser.SP);
                this.state = 934;
                this.oC_Limit();
                }
                break;
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_ProjectionItems(): OC_ProjectionItemsContext {
        let localContext = new OC_ProjectionItemsContext(this.context, this.state);
        this.enterRule(localContext, 78, CypherParser.RULE_oC_ProjectionItems);
        let _la: number;
        try {
            let alternative: number;
            this.state = 965;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.T__10:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 937;
                this.match(CypherParser.T__10);
                this.state = 948;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 139, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 939;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 938;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 941;
                        this.match(CypherParser.T__3);
                        this.state = 943;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 942;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 945;
                        this.oC_ProjectionItem();
                        }
                        }
                    }
                    this.state = 950;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 139, this.context);
                }
                }
                }
                break;
            case CypherParser.T__2:
            case CypherParser.T__6:
            case CypherParser.T__12:
            case CypherParser.T__20:
            case CypherParser.T__21:
            case CypherParser.T__25:
            case CypherParser.INDEX:
            case CypherParser.ASSERT:
            case CypherParser.FULLTEXT:
            case CypherParser.VECTOR:
            case CypherParser.OPTIONS:
            case CypherParser.ALL:
            case CypherParser.LOAD:
            case CypherParser.CSV:
            case CypherParser.HEADERS:
            case CypherParser.FROM:
            case CypherParser.FIELDTERMINATOR:
            case CypherParser.REMOVE:
            case CypherParser.CALL:
            case CypherParser.YIELD:
            case CypherParser.SHORTESTPATH:
            case CypherParser.ALLSHORTESTPATHS:
            case CypherParser.NOT:
            case CypherParser.NULL:
            case CypherParser.COUNT:
            case CypherParser.CASE:
            case CypherParser.ANY:
            case CypherParser.NONE:
            case CypherParser.SINGLE:
            case CypherParser.REDUCE:
            case CypherParser.EXISTS:
            case CypherParser.TRUE:
            case CypherParser.FALSE:
            case CypherParser.HexInteger:
            case CypherParser.DecimalInteger:
            case CypherParser.OctalInteger:
            case CypherParser.HexLetter:
            case CypherParser.ExponentDecimalReal:
            case CypherParser.RegularDecimalReal:
            case CypherParser.StringLiteral:
            case CypherParser.DROP:
            case CypherParser.FILTER:
            case CypherParser.EXTRACT:
            case CypherParser.CYPHER:
            case CypherParser.UnescapedSymbolicName:
            case CypherParser.EscapedSymbolicName:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 951;
                this.oC_ProjectionItem();
                this.state = 962;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 142, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 953;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 952;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 955;
                        this.match(CypherParser.T__3);
                        this.state = 957;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 956;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 959;
                        this.oC_ProjectionItem();
                        }
                        }
                    }
                    this.state = 964;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 142, this.context);
                }
                }
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_ProjectionItem(): OC_ProjectionItemContext {
        let localContext = new OC_ProjectionItemContext(this.context, this.state);
        this.enterRule(localContext, 80, CypherParser.RULE_oC_ProjectionItem);
        let _la: number;
        try {
            this.state = 980;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 146, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 967;
                this.oC_Expression();
                this.state = 968;
                this.match(CypherParser.SP);
                this.state = 969;
                this.match(CypherParser.AS);
                this.state = 970;
                this.match(CypherParser.SP);
                this.state = 971;
                this.oC_Variable();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 973;
                this.oC_Expression();
                this.state = 978;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 145, this.context) ) {
                case 1:
                    {
                    this.state = 975;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 974;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 977;
                    this.oC_MapProjection();
                    }
                    break;
                }
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_MapProjection(): OC_MapProjectionContext {
        let localContext = new OC_MapProjectionContext(this.context, this.state);
        this.enterRule(localContext, 82, CypherParser.RULE_oC_MapProjection);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 982;
            this.match(CypherParser.T__6);
            this.state = 984;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 147, this.context) ) {
            case 1:
                {
                this.state = 983;
                this.match(CypherParser.SP);
                }
                break;
            }
            this.state = 1000;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 12 || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 4294967295) !== 0) || ((((_la - 78)) & ~0x1F) === 0 && ((1 << (_la - 78)) & 2147483647) !== 0) || ((((_la - 112)) & ~0x1F) === 0 && ((1 << (_la - 112)) & 167770113) !== 0)) {
                {
                this.state = 986;
                this.oC_MapProjectionElement();
                this.state = 997;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 150, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 988;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 987;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 990;
                        this.match(CypherParser.T__3);
                        this.state = 992;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 991;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 994;
                        this.oC_MapProjectionElement();
                        }
                        }
                    }
                    this.state = 999;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 150, this.context);
                }
                }
            }

            this.state = 1003;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1002;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1005;
            this.match(CypherParser.T__7);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_MapProjectionElement(): OC_MapProjectionElementContext {
        let localContext = new OC_MapProjectionElementContext(this.context, this.state);
        this.enterRule(localContext, 84, CypherParser.RULE_oC_MapProjectionElement);
        let _la: number;
        try {
            this.state = 1028;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 157, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1007;
                this.match(CypherParser.T__11);
                this.state = 1009;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1008;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1011;
                this.match(CypherParser.T__10);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1012;
                this.match(CypherParser.T__11);
                this.state = 1014;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1013;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1016;
                this.oC_PropertyKeyName();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1017;
                this.oC_PropertyKeyName();
                this.state = 1019;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1018;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1021;
                this.match(CypherParser.T__1);
                this.state = 1023;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1022;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1025;
                this.oC_Expression();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 1027;
                this.oC_Variable();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_Order(): OC_OrderContext {
        let localContext = new OC_OrderContext(this.context, this.state);
        this.enterRule(localContext, 86, CypherParser.RULE_oC_Order);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1030;
            this.match(CypherParser.ORDER);
            this.state = 1031;
            this.match(CypherParser.SP);
            this.state = 1032;
            this.match(CypherParser.BY);
            this.state = 1033;
            this.match(CypherParser.SP);
            this.state = 1034;
            this.oC_SortItem();
            this.state = 1042;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 4) {
                {
                {
                this.state = 1035;
                this.match(CypherParser.T__3);
                this.state = 1037;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1036;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1039;
                this.oC_SortItem();
                }
                }
                this.state = 1044;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_Skip(): OC_SkipContext {
        let localContext = new OC_SkipContext(this.context, this.state);
        this.enterRule(localContext, 88, CypherParser.RULE_oC_Skip);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1045;
            this.match(CypherParser.L_SKIP);
            this.state = 1046;
            this.match(CypherParser.SP);
            this.state = 1047;
            this.oC_Expression();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_Limit(): OC_LimitContext {
        let localContext = new OC_LimitContext(this.context, this.state);
        this.enterRule(localContext, 90, CypherParser.RULE_oC_Limit);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1049;
            this.match(CypherParser.LIMIT);
            this.state = 1050;
            this.match(CypherParser.SP);
            this.state = 1051;
            this.oC_Expression();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_SortItem(): OC_SortItemContext {
        let localContext = new OC_SortItemContext(this.context, this.state);
        this.enterRule(localContext, 92, CypherParser.RULE_oC_SortItem);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1053;
            this.oC_Expression();
            this.state = 1058;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 161, this.context) ) {
            case 1:
                {
                this.state = 1055;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1054;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1057;
                _la = this.tokenStream.LA(1);
                if(!(((((_la - 79)) & ~0x1F) === 0 && ((1 << (_la - 79)) & 15) !== 0))) {
                this.errorHandler.recoverInline(this);
                }
                else {
                    this.errorHandler.reportMatch(this);
                    this.consume();
                }
                }
                break;
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_Where(): OC_WhereContext {
        let localContext = new OC_WhereContext(this.context, this.state);
        this.enterRule(localContext, 94, CypherParser.RULE_oC_Where);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1060;
            this.match(CypherParser.WHERE);
            this.state = 1061;
            this.match(CypherParser.SP);
            this.state = 1062;
            this.oC_Expression();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_Pattern(): OC_PatternContext {
        let localContext = new OC_PatternContext(this.context, this.state);
        this.enterRule(localContext, 96, CypherParser.RULE_oC_Pattern);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1064;
            this.oC_PatternPart();
            this.state = 1075;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 164, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1066;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1065;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1068;
                    this.match(CypherParser.T__3);
                    this.state = 1070;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1069;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1072;
                    this.oC_PatternPart();
                    }
                    }
                }
                this.state = 1077;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 164, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_PatternPart(): OC_PatternPartContext {
        let localContext = new OC_PatternPartContext(this.context, this.state);
        this.enterRule(localContext, 98, CypherParser.RULE_oC_PatternPart);
        let _la: number;
        try {
            this.state = 1089;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 167, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1078;
                this.oC_Variable();
                this.state = 1080;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1079;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1082;
                this.match(CypherParser.T__8);
                this.state = 1084;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1083;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1086;
                this.oC_AnonymousPatternPart();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1088;
                this.oC_AnonymousPatternPart();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_AnonymousPatternPart(): OC_AnonymousPatternPartContext {
        let localContext = new OC_AnonymousPatternPartContext(this.context, this.state);
        this.enterRule(localContext, 100, CypherParser.RULE_oC_AnonymousPatternPart);
        try {
            this.state = 1093;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.SHORTESTPATH:
            case CypherParser.ALLSHORTESTPATHS:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1091;
                this.oC_ShortestPathPattern();
                }
                break;
            case CypherParser.T__2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1092;
                this.oC_PatternElement();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_ShortestPathPattern(): OC_ShortestPathPatternContext {
        let localContext = new OC_ShortestPathPatternContext(this.context, this.state);
        this.enterRule(localContext, 102, CypherParser.RULE_oC_ShortestPathPattern);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1095;
            _la = this.tokenStream.LA(1);
            if(!(_la === 84 || _la === 85)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            this.state = 1097;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1096;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1099;
            this.match(CypherParser.T__2);
            this.state = 1101;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1100;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1103;
            this.oC_PatternElement();
            this.state = 1105;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1104;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1107;
            this.match(CypherParser.T__4);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_PatternElement(): OC_PatternElementContext {
        let localContext = new OC_PatternElementContext(this.context, this.state);
        this.enterRule(localContext, 104, CypherParser.RULE_oC_PatternElement);
        let _la: number;
        try {
            let alternative: number;
            this.state = 1123;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 174, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1109;
                this.oC_NodePattern();
                this.state = 1116;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 173, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 1111;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1110;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1113;
                        this.oC_PatternElementChain();
                        }
                        }
                    }
                    this.state = 1118;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 173, this.context);
                }
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1119;
                this.match(CypherParser.T__2);
                this.state = 1120;
                this.oC_PatternElement();
                this.state = 1121;
                this.match(CypherParser.T__4);
                }
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_RelationshipsPattern(): OC_RelationshipsPatternContext {
        let localContext = new OC_RelationshipsPatternContext(this.context, this.state);
        this.enterRule(localContext, 106, CypherParser.RULE_oC_RelationshipsPattern);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1125;
            this.oC_NodePattern();
            this.state = 1130;
            this.errorHandler.sync(this);
            alternative = 1;
            do {
                switch (alternative) {
                case 1:
                    {
                    {
                    this.state = 1127;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1126;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1129;
                    this.oC_PatternElementChain();
                    }
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 1132;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 176, this.context);
            } while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_NodePattern(): OC_NodePatternContext {
        let localContext = new OC_NodePatternContext(this.context, this.state);
        this.enterRule(localContext, 108, CypherParser.RULE_oC_NodePattern);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1134;
            this.match(CypherParser.T__2);
            this.state = 1136;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1135;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1142;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 58724255) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 276566019) !== 0) || ((((_la - 132)) & ~0x1F) === 0 && ((1 << (_la - 132)) & 159) !== 0)) {
                {
                this.state = 1138;
                this.oC_Variable();
                this.state = 1140;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1139;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1148;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 2) {
                {
                this.state = 1144;
                this.oC_NodeLabels();
                this.state = 1146;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1145;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1154;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 7 || _la === 26) {
                {
                this.state = 1150;
                this.oC_Properties();
                this.state = 1152;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1151;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1156;
            this.match(CypherParser.T__4);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_PatternElementChain(): OC_PatternElementChainContext {
        let localContext = new OC_PatternElementChainContext(this.context, this.state);
        this.enterRule(localContext, 110, CypherParser.RULE_oC_PatternElementChain);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1158;
            this.oC_RelationshipPattern();
            this.state = 1160;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1159;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1162;
            this.oC_NodePattern();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_RelationshipPattern(): OC_RelationshipPatternContext {
        let localContext = new OC_RelationshipPatternContext(this.context, this.state);
        this.enterRule(localContext, 112, CypherParser.RULE_oC_RelationshipPattern);
        let _la: number;
        try {
            this.state = 1228;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 201, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1164;
                this.oC_LeftArrowHead();
                this.state = 1166;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1165;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1168;
                this.oC_Dash();
                this.state = 1170;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 186, this.context) ) {
                case 1:
                    {
                    this.state = 1169;
                    this.match(CypherParser.SP);
                    }
                    break;
                }
                this.state = 1173;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 13) {
                    {
                    this.state = 1172;
                    this.oC_RelationshipDetail();
                    }
                }

                this.state = 1176;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1175;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1178;
                this.oC_Dash();
                this.state = 1180;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1179;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1182;
                this.oC_RightArrowHead();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1184;
                this.oC_LeftArrowHead();
                this.state = 1186;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1185;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1188;
                this.oC_Dash();
                this.state = 1190;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 191, this.context) ) {
                case 1:
                    {
                    this.state = 1189;
                    this.match(CypherParser.SP);
                    }
                    break;
                }
                this.state = 1193;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 13) {
                    {
                    this.state = 1192;
                    this.oC_RelationshipDetail();
                    }
                }

                this.state = 1196;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1195;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1198;
                this.oC_Dash();
                }
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                {
                this.state = 1200;
                this.oC_Dash();
                this.state = 1202;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 194, this.context) ) {
                case 1:
                    {
                    this.state = 1201;
                    this.match(CypherParser.SP);
                    }
                    break;
                }
                this.state = 1205;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 13) {
                    {
                    this.state = 1204;
                    this.oC_RelationshipDetail();
                    }
                }

                this.state = 1208;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1207;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1210;
                this.oC_Dash();
                this.state = 1212;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1211;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1214;
                this.oC_RightArrowHead();
                }
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 1216;
                this.oC_Dash();
                this.state = 1218;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 198, this.context) ) {
                case 1:
                    {
                    this.state = 1217;
                    this.match(CypherParser.SP);
                    }
                    break;
                }
                this.state = 1221;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 13) {
                    {
                    this.state = 1220;
                    this.oC_RelationshipDetail();
                    }
                }

                this.state = 1224;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1223;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1226;
                this.oC_Dash();
                }
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_RelationshipDetail(): OC_RelationshipDetailContext {
        let localContext = new OC_RelationshipDetailContext(this.context, this.state);
        this.enterRule(localContext, 114, CypherParser.RULE_oC_RelationshipDetail);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1230;
            this.match(CypherParser.T__12);
            this.state = 1232;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1231;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1238;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 58724255) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 276566019) !== 0) || ((((_la - 132)) & ~0x1F) === 0 && ((1 << (_la - 132)) & 159) !== 0)) {
                {
                this.state = 1234;
                this.oC_Variable();
                this.state = 1236;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1235;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1244;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 2) {
                {
                this.state = 1240;
                this.oC_RelationshipTypes();
                this.state = 1242;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1241;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1247;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 11) {
                {
                this.state = 1246;
                this.oC_RangeLiteral();
                }
            }

            this.state = 1253;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 7 || _la === 26) {
                {
                this.state = 1249;
                this.oC_Properties();
                this.state = 1251;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1250;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1255;
            this.match(CypherParser.T__13);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_Properties(): OC_PropertiesContext {
        let localContext = new OC_PropertiesContext(this.context, this.state);
        this.enterRule(localContext, 116, CypherParser.RULE_oC_Properties);
        try {
            this.state = 1259;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.T__6:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1257;
                this.oC_MapLiteral();
                }
                break;
            case CypherParser.T__25:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1258;
                this.oC_Parameter();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_RelationshipTypes(): OC_RelationshipTypesContext {
        let localContext = new OC_RelationshipTypesContext(this.context, this.state);
        this.enterRule(localContext, 118, CypherParser.RULE_oC_RelationshipTypes);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1261;
            this.match(CypherParser.T__1);
            this.state = 1263;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1262;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1265;
            this.oC_RelTypeName();
            this.state = 1279;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 215, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1267;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1266;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1269;
                    this.match(CypherParser.T__5);
                    this.state = 1271;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 2) {
                        {
                        this.state = 1270;
                        this.match(CypherParser.T__1);
                        }
                    }

                    this.state = 1274;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1273;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1276;
                    this.oC_RelTypeName();
                    }
                    }
                }
                this.state = 1281;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 215, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_NodeLabels(): OC_NodeLabelsContext {
        let localContext = new OC_NodeLabelsContext(this.context, this.state);
        this.enterRule(localContext, 120, CypherParser.RULE_oC_NodeLabels);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1282;
            this.oC_NodeLabel();
            this.state = 1289;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 217, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1284;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1283;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1286;
                    this.oC_NodeLabel();
                    }
                    }
                }
                this.state = 1291;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 217, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_NodeLabel(): OC_NodeLabelContext {
        let localContext = new OC_NodeLabelContext(this.context, this.state);
        this.enterRule(localContext, 122, CypherParser.RULE_oC_NodeLabel);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1292;
            this.match(CypherParser.T__1);
            this.state = 1294;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1293;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1296;
            this.oC_LabelName();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_RangeLiteral(): OC_RangeLiteralContext {
        let localContext = new OC_RangeLiteralContext(this.context, this.state);
        this.enterRule(localContext, 124, CypherParser.RULE_oC_RangeLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1298;
            this.match(CypherParser.T__10);
            this.state = 1300;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1299;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1306;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 109)) & ~0x1F) === 0 && ((1 << (_la - 109)) & 7) !== 0)) {
                {
                this.state = 1302;
                this.oC_IntegerLiteral();
                this.state = 1304;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1303;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1318;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 15) {
                {
                this.state = 1308;
                this.match(CypherParser.T__14);
                this.state = 1310;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1309;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1316;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (((((_la - 109)) & ~0x1F) === 0 && ((1 << (_la - 109)) & 7) !== 0)) {
                    {
                    this.state = 1312;
                    this.oC_IntegerLiteral();
                    this.state = 1314;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1313;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                }

                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_LabelName(): OC_LabelNameContext {
        let localContext = new OC_LabelNameContext(this.context, this.state);
        this.enterRule(localContext, 126, CypherParser.RULE_oC_LabelName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1320;
            this.oC_SchemaName();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_RelTypeName(): OC_RelTypeNameContext {
        let localContext = new OC_RelTypeNameContext(this.context, this.state);
        this.enterRule(localContext, 128, CypherParser.RULE_oC_RelTypeName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1322;
            this.oC_SchemaName();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_PropertyExpression(): OC_PropertyExpressionContext {
        let localContext = new OC_PropertyExpressionContext(this.context, this.state);
        this.enterRule(localContext, 130, CypherParser.RULE_oC_PropertyExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1324;
            this.oC_Atom();
            this.state = 1329;
            this.errorHandler.sync(this);
            alternative = 1;
            do {
                switch (alternative) {
                case 1:
                    {
                    {
                    this.state = 1326;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1325;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1328;
                    this.oC_PropertyLookup();
                    }
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 1331;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 227, this.context);
            } while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_Expression(): OC_ExpressionContext {
        let localContext = new OC_ExpressionContext(this.context, this.state);
        this.enterRule(localContext, 132, CypherParser.RULE_oC_Expression);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1333;
            this.oC_OrExpression();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_OrExpression(): OC_OrExpressionContext {
        let localContext = new OC_OrExpressionContext(this.context, this.state);
        this.enterRule(localContext, 134, CypherParser.RULE_oC_OrExpression);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1335;
            this.oC_XorExpression();
            this.state = 1342;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 228, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1336;
                    this.match(CypherParser.SP);
                    this.state = 1337;
                    this.match(CypherParser.OR);
                    this.state = 1338;
                    this.match(CypherParser.SP);
                    this.state = 1339;
                    this.oC_XorExpression();
                    }
                    }
                }
                this.state = 1344;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 228, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_XorExpression(): OC_XorExpressionContext {
        let localContext = new OC_XorExpressionContext(this.context, this.state);
        this.enterRule(localContext, 136, CypherParser.RULE_oC_XorExpression);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1345;
            this.oC_AndExpression();
            this.state = 1352;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 229, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1346;
                    this.match(CypherParser.SP);
                    this.state = 1347;
                    this.match(CypherParser.XOR);
                    this.state = 1348;
                    this.match(CypherParser.SP);
                    this.state = 1349;
                    this.oC_AndExpression();
                    }
                    }
                }
                this.state = 1354;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 229, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_AndExpression(): OC_AndExpressionContext {
        let localContext = new OC_AndExpressionContext(this.context, this.state);
        this.enterRule(localContext, 138, CypherParser.RULE_oC_AndExpression);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1355;
            this.oC_NotExpression();
            this.state = 1362;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 230, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1356;
                    this.match(CypherParser.SP);
                    this.state = 1357;
                    this.match(CypherParser.AND);
                    this.state = 1358;
                    this.match(CypherParser.SP);
                    this.state = 1359;
                    this.oC_NotExpression();
                    }
                    }
                }
                this.state = 1364;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 230, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_NotExpression(): OC_NotExpressionContext {
        let localContext = new OC_NotExpressionContext(this.context, this.state);
        this.enterRule(localContext, 140, CypherParser.RULE_oC_NotExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1371;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 89) {
                {
                {
                this.state = 1365;
                this.match(CypherParser.NOT);
                this.state = 1367;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1366;
                    this.match(CypherParser.SP);
                    }
                }

                }
                }
                this.state = 1373;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 1374;
            this.oC_ComparisonExpression();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_ComparisonExpression(): OC_ComparisonExpressionContext {
        let localContext = new OC_ComparisonExpressionContext(this.context, this.state);
        this.enterRule(localContext, 142, CypherParser.RULE_oC_ComparisonExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1376;
            this.oC_StringListNullPredicateExpression();
            this.state = 1383;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 234, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1378;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1377;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1380;
                    this.oC_PartialComparisonExpression();
                    }
                    }
                }
                this.state = 1385;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 234, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_PartialComparisonExpression(): OC_PartialComparisonExpressionContext {
        let localContext = new OC_PartialComparisonExpressionContext(this.context, this.state);
        this.enterRule(localContext, 144, CypherParser.RULE_oC_PartialComparisonExpression);
        let _la: number;
        try {
            this.state = 1416;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.T__8:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1386;
                this.match(CypherParser.T__8);
                this.state = 1388;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1387;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1390;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__15:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1391;
                this.match(CypherParser.T__15);
                this.state = 1393;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1392;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1395;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__16:
                this.enterOuterAlt(localContext, 3);
                {
                {
                this.state = 1396;
                this.match(CypherParser.T__16);
                this.state = 1398;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1397;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1400;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__17:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 1401;
                this.match(CypherParser.T__17);
                this.state = 1403;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1402;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1405;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__18:
                this.enterOuterAlt(localContext, 5);
                {
                {
                this.state = 1406;
                this.match(CypherParser.T__18);
                this.state = 1408;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1407;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1410;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__19:
                this.enterOuterAlt(localContext, 6);
                {
                {
                this.state = 1411;
                this.match(CypherParser.T__19);
                this.state = 1413;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1412;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1415;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_StringListNullPredicateExpression(): OC_StringListNullPredicateExpressionContext {
        let localContext = new OC_StringListNullPredicateExpressionContext(this.context, this.state);
        this.enterRule(localContext, 146, CypherParser.RULE_oC_StringListNullPredicateExpression);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1418;
            this.oC_AddOrSubtractExpression();
            this.state = 1424;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 243, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    this.state = 1422;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 242, this.context) ) {
                    case 1:
                        {
                        this.state = 1419;
                        this.oC_StringPredicateExpression();
                        }
                        break;
                    case 2:
                        {
                        this.state = 1420;
                        this.oC_ListPredicateExpression();
                        }
                        break;
                    case 3:
                        {
                        this.state = 1421;
                        this.oC_NullPredicateExpression();
                        }
                        break;
                    }
                    }
                }
                this.state = 1426;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 243, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_StringPredicateExpression(): OC_StringPredicateExpressionContext {
        let localContext = new OC_StringPredicateExpressionContext(this.context, this.state);
        this.enterRule(localContext, 148, CypherParser.RULE_oC_StringPredicateExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1437;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 244, this.context) ) {
            case 1:
                {
                {
                this.state = 1427;
                this.match(CypherParser.SP);
                this.state = 1428;
                this.match(CypherParser.STARTS);
                this.state = 1429;
                this.match(CypherParser.SP);
                this.state = 1430;
                this.match(CypherParser.WITH);
                }
                }
                break;
            case 2:
                {
                {
                this.state = 1431;
                this.match(CypherParser.SP);
                this.state = 1432;
                this.match(CypherParser.ENDS);
                this.state = 1433;
                this.match(CypherParser.SP);
                this.state = 1434;
                this.match(CypherParser.WITH);
                }
                }
                break;
            case 3:
                {
                {
                this.state = 1435;
                this.match(CypherParser.SP);
                this.state = 1436;
                this.match(CypherParser.CONTAINS);
                }
                }
                break;
            }
            this.state = 1440;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1439;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1442;
            this.oC_AddOrSubtractExpression();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_ListPredicateExpression(): OC_ListPredicateExpressionContext {
        let localContext = new OC_ListPredicateExpressionContext(this.context, this.state);
        this.enterRule(localContext, 150, CypherParser.RULE_oC_ListPredicateExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1444;
            this.match(CypherParser.SP);
            this.state = 1445;
            this.match(CypherParser.IN);
            this.state = 1447;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1446;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1449;
            this.oC_AddOrSubtractExpression();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_NullPredicateExpression(): OC_NullPredicateExpressionContext {
        let localContext = new OC_NullPredicateExpressionContext(this.context, this.state);
        this.enterRule(localContext, 152, CypherParser.RULE_oC_NullPredicateExpression);
        try {
            this.state = 1461;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 247, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1451;
                this.match(CypherParser.SP);
                this.state = 1452;
                this.match(CypherParser.IS);
                this.state = 1453;
                this.match(CypherParser.SP);
                this.state = 1454;
                this.match(CypherParser.NULL);
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1455;
                this.match(CypherParser.SP);
                this.state = 1456;
                this.match(CypherParser.IS);
                this.state = 1457;
                this.match(CypherParser.SP);
                this.state = 1458;
                this.match(CypherParser.NOT);
                this.state = 1459;
                this.match(CypherParser.SP);
                this.state = 1460;
                this.match(CypherParser.NULL);
                }
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_AddOrSubtractExpression(): OC_AddOrSubtractExpressionContext {
        let localContext = new OC_AddOrSubtractExpressionContext(this.context, this.state);
        this.enterRule(localContext, 154, CypherParser.RULE_oC_AddOrSubtractExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1463;
            this.oC_MultiplyDivideModuloExpression();
            this.state = 1482;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 253, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    this.state = 1480;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 252, this.context) ) {
                    case 1:
                        {
                        {
                        this.state = 1465;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1464;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1467;
                        this.match(CypherParser.T__20);
                        this.state = 1469;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1468;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1471;
                        this.oC_MultiplyDivideModuloExpression();
                        }
                        }
                        break;
                    case 2:
                        {
                        {
                        this.state = 1473;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1472;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1475;
                        this.match(CypherParser.T__21);
                        this.state = 1477;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1476;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1479;
                        this.oC_MultiplyDivideModuloExpression();
                        }
                        }
                        break;
                    }
                    }
                }
                this.state = 1484;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 253, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_MultiplyDivideModuloExpression(): OC_MultiplyDivideModuloExpressionContext {
        let localContext = new OC_MultiplyDivideModuloExpressionContext(this.context, this.state);
        this.enterRule(localContext, 156, CypherParser.RULE_oC_MultiplyDivideModuloExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1485;
            this.oC_PowerOfExpression();
            this.state = 1512;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 261, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    this.state = 1510;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 260, this.context) ) {
                    case 1:
                        {
                        {
                        this.state = 1487;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1486;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1489;
                        this.match(CypherParser.T__10);
                        this.state = 1491;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1490;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1493;
                        this.oC_PowerOfExpression();
                        }
                        }
                        break;
                    case 2:
                        {
                        {
                        this.state = 1495;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1494;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1497;
                        this.match(CypherParser.T__22);
                        this.state = 1499;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1498;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1501;
                        this.oC_PowerOfExpression();
                        }
                        }
                        break;
                    case 3:
                        {
                        {
                        this.state = 1503;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1502;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1505;
                        this.match(CypherParser.T__23);
                        this.state = 1507;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1506;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1509;
                        this.oC_PowerOfExpression();
                        }
                        }
                        break;
                    }
                    }
                }
                this.state = 1514;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 261, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_PowerOfExpression(): OC_PowerOfExpressionContext {
        let localContext = new OC_PowerOfExpressionContext(this.context, this.state);
        this.enterRule(localContext, 158, CypherParser.RULE_oC_PowerOfExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1515;
            this.oC_UnaryAddOrSubtractExpression();
            this.state = 1526;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 264, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1517;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1516;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1519;
                    this.match(CypherParser.T__24);
                    this.state = 1521;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1520;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1523;
                    this.oC_UnaryAddOrSubtractExpression();
                    }
                    }
                }
                this.state = 1528;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 264, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_UnaryAddOrSubtractExpression(): OC_UnaryAddOrSubtractExpressionContext {
        let localContext = new OC_UnaryAddOrSubtractExpressionContext(this.context, this.state);
        this.enterRule(localContext, 160, CypherParser.RULE_oC_UnaryAddOrSubtractExpression);
        let _la: number;
        try {
            this.state = 1535;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.T__2:
            case CypherParser.T__6:
            case CypherParser.T__12:
            case CypherParser.T__25:
            case CypherParser.INDEX:
            case CypherParser.ASSERT:
            case CypherParser.FULLTEXT:
            case CypherParser.VECTOR:
            case CypherParser.OPTIONS:
            case CypherParser.ALL:
            case CypherParser.LOAD:
            case CypherParser.CSV:
            case CypherParser.HEADERS:
            case CypherParser.FROM:
            case CypherParser.FIELDTERMINATOR:
            case CypherParser.REMOVE:
            case CypherParser.CALL:
            case CypherParser.YIELD:
            case CypherParser.SHORTESTPATH:
            case CypherParser.ALLSHORTESTPATHS:
            case CypherParser.NULL:
            case CypherParser.COUNT:
            case CypherParser.CASE:
            case CypherParser.ANY:
            case CypherParser.NONE:
            case CypherParser.SINGLE:
            case CypherParser.REDUCE:
            case CypherParser.EXISTS:
            case CypherParser.TRUE:
            case CypherParser.FALSE:
            case CypherParser.HexInteger:
            case CypherParser.DecimalInteger:
            case CypherParser.OctalInteger:
            case CypherParser.HexLetter:
            case CypherParser.ExponentDecimalReal:
            case CypherParser.RegularDecimalReal:
            case CypherParser.StringLiteral:
            case CypherParser.DROP:
            case CypherParser.FILTER:
            case CypherParser.EXTRACT:
            case CypherParser.CYPHER:
            case CypherParser.UnescapedSymbolicName:
            case CypherParser.EscapedSymbolicName:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1529;
                this.oC_NonArithmeticOperatorExpression();
                }
                break;
            case CypherParser.T__20:
            case CypherParser.T__21:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1530;
                _la = this.tokenStream.LA(1);
                if(!(_la === 21 || _la === 22)) {
                this.errorHandler.recoverInline(this);
                }
                else {
                    this.errorHandler.reportMatch(this);
                    this.consume();
                }
                this.state = 1532;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1531;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1534;
                this.oC_NonArithmeticOperatorExpression();
                }
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_NonArithmeticOperatorExpression(): OC_NonArithmeticOperatorExpressionContext {
        let localContext = new OC_NonArithmeticOperatorExpressionContext(this.context, this.state);
        this.enterRule(localContext, 162, CypherParser.RULE_oC_NonArithmeticOperatorExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1537;
            this.oC_Atom();
            this.state = 1548;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 270, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    this.state = 1546;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 269, this.context) ) {
                    case 1:
                        {
                        {
                        this.state = 1539;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1538;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1541;
                        this.oC_ListOperatorExpression();
                        }
                        }
                        break;
                    case 2:
                        {
                        {
                        this.state = 1543;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1542;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1545;
                        this.oC_PropertyLookup();
                        }
                        }
                        break;
                    }
                    }
                }
                this.state = 1550;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 270, this.context);
            }
            this.state = 1555;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 272, this.context) ) {
            case 1:
                {
                this.state = 1552;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1551;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1554;
                this.oC_NodeLabels();
                }
                break;
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_ListOperatorExpression(): OC_ListOperatorExpressionContext {
        let localContext = new OC_ListOperatorExpressionContext(this.context, this.state);
        this.enterRule(localContext, 164, CypherParser.RULE_oC_ListOperatorExpression);
        let _la: number;
        try {
            this.state = 1570;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 275, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1557;
                this.match(CypherParser.T__12);
                this.state = 1558;
                this.oC_Expression();
                this.state = 1559;
                this.match(CypherParser.T__13);
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1561;
                this.match(CypherParser.T__12);
                this.state = 1563;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 73408648) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 58724319) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 536623139) !== 0) || ((((_la - 119)) & ~0x1F) === 0 && ((1 << (_la - 119)) & 1302535) !== 0)) {
                    {
                    this.state = 1562;
                    this.oC_Expression();
                    }
                }

                this.state = 1565;
                this.match(CypherParser.T__14);
                this.state = 1567;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 73408648) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 58724319) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 536623139) !== 0) || ((((_la - 119)) & ~0x1F) === 0 && ((1 << (_la - 119)) & 1302535) !== 0)) {
                    {
                    this.state = 1566;
                    this.oC_Expression();
                    }
                }

                this.state = 1569;
                this.match(CypherParser.T__13);
                }
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_PropertyLookup(): OC_PropertyLookupContext {
        let localContext = new OC_PropertyLookupContext(this.context, this.state);
        this.enterRule(localContext, 166, CypherParser.RULE_oC_PropertyLookup);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1572;
            this.match(CypherParser.T__11);
            this.state = 1574;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1573;
                this.match(CypherParser.SP);
                }
            }

            {
            this.state = 1576;
            this.oC_PropertyKeyName();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_Atom(): OC_AtomContext {
        let localContext = new OC_AtomContext(this.context, this.state);
        this.enterRule(localContext, 168, CypherParser.RULE_oC_Atom);
        let _la: number;
        try {
            this.state = 1604;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 280, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1578;
                this.oC_Literal();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1579;
                this.oC_Parameter();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1580;
                this.oC_CaseExpression();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 1581;
                this.match(CypherParser.COUNT);
                this.state = 1583;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1582;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1585;
                this.match(CypherParser.T__2);
                this.state = 1587;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1586;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1589;
                this.match(CypherParser.T__10);
                this.state = 1591;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1590;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1593;
                this.match(CypherParser.T__4);
                }
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 1594;
                this.oC_ListComprehension();
                }
                break;
            case 6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 1595;
                this.oC_PatternComprehension();
                }
                break;
            case 7:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 1596;
                this.oC_ReduceExpression();
                }
                break;
            case 8:
                this.enterOuterAlt(localContext, 8);
                {
                this.state = 1597;
                this.oC_ShortestPathPattern();
                }
                break;
            case 9:
                this.enterOuterAlt(localContext, 9);
                {
                this.state = 1598;
                this.oC_Quantifier();
                }
                break;
            case 10:
                this.enterOuterAlt(localContext, 10);
                {
                this.state = 1599;
                this.oC_PatternPredicate();
                }
                break;
            case 11:
                this.enterOuterAlt(localContext, 11);
                {
                this.state = 1600;
                this.oC_ParenthesizedExpression();
                }
                break;
            case 12:
                this.enterOuterAlt(localContext, 12);
                {
                this.state = 1601;
                this.oC_FunctionInvocation();
                }
                break;
            case 13:
                this.enterOuterAlt(localContext, 13);
                {
                this.state = 1602;
                this.oC_ExistentialSubquery();
                }
                break;
            case 14:
                this.enterOuterAlt(localContext, 14);
                {
                this.state = 1603;
                this.oC_Variable();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_CaseExpression(): OC_CaseExpressionContext {
        let localContext = new OC_CaseExpressionContext(this.context, this.state);
        this.enterRule(localContext, 170, CypherParser.RULE_oC_CaseExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1628;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 286, this.context) ) {
            case 1:
                {
                {
                this.state = 1606;
                this.match(CypherParser.CASE);
                this.state = 1611;
                this.errorHandler.sync(this);
                alternative = 1;
                do {
                    switch (alternative) {
                    case 1:
                        {
                        {
                        this.state = 1608;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1607;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1610;
                        this.oC_CaseAlternative();
                        }
                        }
                        break;
                    default:
                        throw new antlr.NoViableAltException(this);
                    }
                    this.state = 1613;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 282, this.context);
                } while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER);
                }
                }
                break;
            case 2:
                {
                {
                this.state = 1615;
                this.match(CypherParser.CASE);
                this.state = 1617;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1616;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1619;
                this.oC_Expression();
                this.state = 1624;
                this.errorHandler.sync(this);
                alternative = 1;
                do {
                    switch (alternative) {
                    case 1:
                        {
                        {
                        this.state = 1621;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1620;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1623;
                        this.oC_CaseAlternative();
                        }
                        }
                        break;
                    default:
                        throw new antlr.NoViableAltException(this);
                    }
                    this.state = 1626;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 285, this.context);
                } while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER);
                }
                }
                break;
            }
            this.state = 1638;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 289, this.context) ) {
            case 1:
                {
                this.state = 1631;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1630;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1633;
                this.match(CypherParser.ELSE);
                this.state = 1635;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1634;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1637;
                this.oC_Expression();
                }
                break;
            }
            this.state = 1641;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1640;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1643;
            this.match(CypherParser.END);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_CaseAlternative(): OC_CaseAlternativeContext {
        let localContext = new OC_CaseAlternativeContext(this.context, this.state);
        this.enterRule(localContext, 172, CypherParser.RULE_oC_CaseAlternative);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1645;
            this.match(CypherParser.WHEN);
            this.state = 1647;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1646;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1649;
            this.oC_Expression();
            this.state = 1651;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1650;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1653;
            this.match(CypherParser.THEN);
            this.state = 1655;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1654;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1657;
            this.oC_Expression();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_ListComprehension(): OC_ListComprehensionContext {
        let localContext = new OC_ListComprehensionContext(this.context, this.state);
        this.enterRule(localContext, 174, CypherParser.RULE_oC_ListComprehension);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1659;
            this.match(CypherParser.T__12);
            this.state = 1661;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1660;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1663;
            this.oC_FilterExpression();
            this.state = 1672;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 297, this.context) ) {
            case 1:
                {
                this.state = 1665;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1664;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1667;
                this.match(CypherParser.T__5);
                this.state = 1669;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1668;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1671;
                this.oC_Expression();
                }
                break;
            }
            this.state = 1675;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1674;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1677;
            this.match(CypherParser.T__13);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_PatternComprehension(): OC_PatternComprehensionContext {
        let localContext = new OC_PatternComprehensionContext(this.context, this.state);
        this.enterRule(localContext, 176, CypherParser.RULE_oC_PatternComprehension);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1679;
            this.match(CypherParser.T__12);
            this.state = 1681;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1680;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1691;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 58724255) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 276566019) !== 0) || ((((_la - 132)) & ~0x1F) === 0 && ((1 << (_la - 132)) & 159) !== 0)) {
                {
                this.state = 1683;
                this.oC_Variable();
                this.state = 1685;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1684;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1687;
                this.match(CypherParser.T__8);
                this.state = 1689;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1688;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1693;
            this.oC_RelationshipsPattern();
            this.state = 1695;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1694;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1701;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 83) {
                {
                this.state = 1697;
                this.oC_Where();
                this.state = 1699;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1698;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1703;
            this.match(CypherParser.T__5);
            this.state = 1705;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1704;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1707;
            this.oC_Expression();
            this.state = 1709;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1708;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1711;
            this.match(CypherParser.T__13);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_Quantifier(): OC_QuantifierContext {
        let localContext = new OC_QuantifierContext(this.context, this.state);
        this.enterRule(localContext, 178, CypherParser.RULE_oC_Quantifier);
        let _la: number;
        try {
            this.state = 1769;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.ALL:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1713;
                this.match(CypherParser.ALL);
                this.state = 1715;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1714;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1717;
                this.match(CypherParser.T__2);
                this.state = 1719;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1718;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1721;
                this.oC_FilterExpression();
                this.state = 1723;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1722;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1725;
                this.match(CypherParser.T__4);
                }
                }
                break;
            case CypherParser.ANY:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1727;
                this.match(CypherParser.ANY);
                this.state = 1729;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1728;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1731;
                this.match(CypherParser.T__2);
                this.state = 1733;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1732;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1735;
                this.oC_FilterExpression();
                this.state = 1737;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1736;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1739;
                this.match(CypherParser.T__4);
                }
                }
                break;
            case CypherParser.NONE:
                this.enterOuterAlt(localContext, 3);
                {
                {
                this.state = 1741;
                this.match(CypherParser.NONE);
                this.state = 1743;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1742;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1745;
                this.match(CypherParser.T__2);
                this.state = 1747;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1746;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1749;
                this.oC_FilterExpression();
                this.state = 1751;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1750;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1753;
                this.match(CypherParser.T__4);
                }
                }
                break;
            case CypherParser.SINGLE:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 1755;
                this.match(CypherParser.SINGLE);
                this.state = 1757;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1756;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1759;
                this.match(CypherParser.T__2);
                this.state = 1761;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1760;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1763;
                this.oC_FilterExpression();
                this.state = 1765;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1764;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1767;
                this.match(CypherParser.T__4);
                }
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_FilterExpression(): OC_FilterExpressionContext {
        let localContext = new OC_FilterExpressionContext(this.context, this.state);
        this.enterRule(localContext, 180, CypherParser.RULE_oC_FilterExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1771;
            this.oC_IdInColl();
            this.state = 1776;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 322, this.context) ) {
            case 1:
                {
                this.state = 1773;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1772;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1775;
                this.oC_Where();
                }
                break;
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_PatternPredicate(): OC_PatternPredicateContext {
        let localContext = new OC_PatternPredicateContext(this.context, this.state);
        this.enterRule(localContext, 182, CypherParser.RULE_oC_PatternPredicate);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1778;
            this.oC_RelationshipsPattern();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_ParenthesizedExpression(): OC_ParenthesizedExpressionContext {
        let localContext = new OC_ParenthesizedExpressionContext(this.context, this.state);
        this.enterRule(localContext, 184, CypherParser.RULE_oC_ParenthesizedExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1780;
            this.match(CypherParser.T__2);
            this.state = 1782;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1781;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1784;
            this.oC_Expression();
            this.state = 1786;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1785;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1788;
            this.match(CypherParser.T__4);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_IdInColl(): OC_IdInCollContext {
        let localContext = new OC_IdInCollContext(this.context, this.state);
        this.enterRule(localContext, 186, CypherParser.RULE_oC_IdInColl);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1790;
            this.oC_Variable();
            this.state = 1791;
            this.match(CypherParser.SP);
            this.state = 1792;
            this.match(CypherParser.IN);
            this.state = 1793;
            this.match(CypherParser.SP);
            this.state = 1794;
            this.oC_Expression();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_ReduceExpression(): OC_ReduceExpressionContext {
        let localContext = new OC_ReduceExpressionContext(this.context, this.state);
        this.enterRule(localContext, 188, CypherParser.RULE_oC_ReduceExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1796;
            this.match(CypherParser.REDUCE);
            this.state = 1798;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1797;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1800;
            this.match(CypherParser.T__2);
            this.state = 1802;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1801;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1804;
            this.oC_Variable();
            this.state = 1806;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1805;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1808;
            this.match(CypherParser.T__8);
            this.state = 1810;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1809;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1812;
            this.oC_Expression();
            this.state = 1814;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1813;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1816;
            this.match(CypherParser.T__3);
            this.state = 1818;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1817;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1820;
            this.oC_IdInColl();
            this.state = 1822;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1821;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1824;
            this.match(CypherParser.T__5);
            this.state = 1826;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1825;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1828;
            this.oC_Expression();
            this.state = 1830;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1829;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1832;
            this.match(CypherParser.T__4);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_FunctionInvocation(): OC_FunctionInvocationContext {
        let localContext = new OC_FunctionInvocationContext(this.context, this.state);
        this.enterRule(localContext, 190, CypherParser.RULE_oC_FunctionInvocation);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1834;
            this.oC_FunctionName();
            this.state = 1836;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1835;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1838;
            this.match(CypherParser.T__2);
            this.state = 1840;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1839;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1846;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 74) {
                {
                this.state = 1842;
                this.match(CypherParser.DISTINCT);
                this.state = 1844;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1843;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1865;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 73408648) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 58724319) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 536623139) !== 0) || ((((_la - 119)) & ~0x1F) === 0 && ((1 << (_la - 119)) & 1302535) !== 0)) {
                {
                this.state = 1848;
                this.oC_Expression();
                this.state = 1850;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1849;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1862;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 4) {
                    {
                    {
                    this.state = 1852;
                    this.match(CypherParser.T__3);
                    this.state = 1854;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1853;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1856;
                    this.oC_Expression();
                    this.state = 1858;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1857;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 1864;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            this.state = 1867;
            this.match(CypherParser.T__4);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_FunctionName(): OC_FunctionNameContext {
        let localContext = new OC_FunctionNameContext(this.context, this.state);
        this.enterRule(localContext, 192, CypherParser.RULE_oC_FunctionName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1869;
            this.oC_Namespace();
            this.state = 1870;
            this.oC_SymbolicName();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_ExistentialSubquery(): OC_ExistentialSubqueryContext {
        let localContext = new OC_ExistentialSubqueryContext(this.context, this.state);
        this.enterRule(localContext, 194, CypherParser.RULE_oC_ExistentialSubquery);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1872;
            this.match(CypherParser.EXISTS);
            this.state = 1874;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1873;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1876;
            this.match(CypherParser.T__6);
            this.state = 1878;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1877;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1896;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 349, this.context) ) {
            case 1:
                {
                this.state = 1880;
                this.oC_RegularQuery();
                }
                break;
            case 2:
                {
                {
                this.state = 1885;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                do {
                    {
                    {
                    this.state = 1881;
                    this.oC_ReadingClause();
                    this.state = 1883;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 345, this.context) ) {
                    case 1:
                        {
                        this.state = 1882;
                        this.match(CypherParser.SP);
                        }
                        break;
                    }
                    }
                    }
                    this.state = 1887;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                } while (((((_la - 53)) & ~0x1F) === 0 && ((1 << (_la - 53)) & 131521) !== 0));
                }
                }
                break;
            case 3:
                {
                {
                this.state = 1889;
                this.oC_Pattern();
                this.state = 1894;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 348, this.context) ) {
                case 1:
                    {
                    this.state = 1891;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1890;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1893;
                    this.oC_Where();
                    }
                    break;
                }
                }
                }
                break;
            }
            this.state = 1899;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1898;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1901;
            this.match(CypherParser.T__7);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_ExplicitProcedureInvocation(): OC_ExplicitProcedureInvocationContext {
        let localContext = new OC_ExplicitProcedureInvocationContext(this.context, this.state);
        this.enterRule(localContext, 196, CypherParser.RULE_oC_ExplicitProcedureInvocation);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1903;
            this.oC_ProcedureName();
            this.state = 1905;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1904;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1907;
            this.match(CypherParser.T__2);
            this.state = 1909;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1908;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1928;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 73408648) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 58724319) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 536623139) !== 0) || ((((_la - 119)) & ~0x1F) === 0 && ((1 << (_la - 119)) & 1302535) !== 0)) {
                {
                this.state = 1911;
                this.oC_Expression();
                this.state = 1913;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1912;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1925;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 4) {
                    {
                    {
                    this.state = 1915;
                    this.match(CypherParser.T__3);
                    this.state = 1917;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1916;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1919;
                    this.oC_Expression();
                    this.state = 1921;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1920;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 1927;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            this.state = 1930;
            this.match(CypherParser.T__4);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_ImplicitProcedureInvocation(): OC_ImplicitProcedureInvocationContext {
        let localContext = new OC_ImplicitProcedureInvocationContext(this.context, this.state);
        this.enterRule(localContext, 198, CypherParser.RULE_oC_ImplicitProcedureInvocation);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1932;
            this.oC_ProcedureName();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_ProcedureResultField(): OC_ProcedureResultFieldContext {
        let localContext = new OC_ProcedureResultFieldContext(this.context, this.state);
        this.enterRule(localContext, 200, CypherParser.RULE_oC_ProcedureResultField);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1934;
            this.oC_SymbolicName();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_ProcedureName(): OC_ProcedureNameContext {
        let localContext = new OC_ProcedureNameContext(this.context, this.state);
        this.enterRule(localContext, 202, CypherParser.RULE_oC_ProcedureName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1936;
            this.oC_Namespace();
            this.state = 1937;
            this.oC_SymbolicName();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_Namespace(): OC_NamespaceContext {
        let localContext = new OC_NamespaceContext(this.context, this.state);
        this.enterRule(localContext, 204, CypherParser.RULE_oC_Namespace);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1944;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 358, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1939;
                    this.oC_SymbolicName();
                    this.state = 1940;
                    this.match(CypherParser.T__11);
                    }
                    }
                }
                this.state = 1946;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 358, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_Variable(): OC_VariableContext {
        let localContext = new OC_VariableContext(this.context, this.state);
        this.enterRule(localContext, 206, CypherParser.RULE_oC_Variable);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1947;
            this.oC_SymbolicName();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_Literal(): OC_LiteralContext {
        let localContext = new OC_LiteralContext(this.context, this.state);
        this.enterRule(localContext, 208, CypherParser.RULE_oC_Literal);
        try {
            this.state = 1955;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.TRUE:
            case CypherParser.FALSE:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1949;
                this.oC_BooleanLiteral();
                }
                break;
            case CypherParser.NULL:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1950;
                this.match(CypherParser.NULL);
                }
                break;
            case CypherParser.HexInteger:
            case CypherParser.DecimalInteger:
            case CypherParser.OctalInteger:
            case CypherParser.ExponentDecimalReal:
            case CypherParser.RegularDecimalReal:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1951;
                this.oC_NumberLiteral();
                }
                break;
            case CypherParser.StringLiteral:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 1952;
                this.match(CypherParser.StringLiteral);
                }
                break;
            case CypherParser.T__12:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 1953;
                this.oC_ListLiteral();
                }
                break;
            case CypherParser.T__6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 1954;
                this.oC_MapLiteral();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_BooleanLiteral(): OC_BooleanLiteralContext {
        let localContext = new OC_BooleanLiteralContext(this.context, this.state);
        this.enterRule(localContext, 210, CypherParser.RULE_oC_BooleanLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1957;
            _la = this.tokenStream.LA(1);
            if(!(_la === 107 || _la === 108)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_NumberLiteral(): OC_NumberLiteralContext {
        let localContext = new OC_NumberLiteralContext(this.context, this.state);
        this.enterRule(localContext, 212, CypherParser.RULE_oC_NumberLiteral);
        try {
            this.state = 1961;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.ExponentDecimalReal:
            case CypherParser.RegularDecimalReal:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1959;
                this.oC_DoubleLiteral();
                }
                break;
            case CypherParser.HexInteger:
            case CypherParser.DecimalInteger:
            case CypherParser.OctalInteger:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1960;
                this.oC_IntegerLiteral();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_IntegerLiteral(): OC_IntegerLiteralContext {
        let localContext = new OC_IntegerLiteralContext(this.context, this.state);
        this.enterRule(localContext, 214, CypherParser.RULE_oC_IntegerLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1963;
            _la = this.tokenStream.LA(1);
            if(!(((((_la - 109)) & ~0x1F) === 0 && ((1 << (_la - 109)) & 7) !== 0))) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_DoubleLiteral(): OC_DoubleLiteralContext {
        let localContext = new OC_DoubleLiteralContext(this.context, this.state);
        this.enterRule(localContext, 216, CypherParser.RULE_oC_DoubleLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1965;
            _la = this.tokenStream.LA(1);
            if(!(_la === 119 || _la === 120)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_ListLiteral(): OC_ListLiteralContext {
        let localContext = new OC_ListLiteralContext(this.context, this.state);
        this.enterRule(localContext, 218, CypherParser.RULE_oC_ListLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1967;
            this.match(CypherParser.T__12);
            this.state = 1969;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1968;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1988;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 73408648) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 58724319) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 536623139) !== 0) || ((((_la - 119)) & ~0x1F) === 0 && ((1 << (_la - 119)) & 1302535) !== 0)) {
                {
                this.state = 1971;
                this.oC_Expression();
                this.state = 1973;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1972;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1985;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 4) {
                    {
                    {
                    this.state = 1975;
                    this.match(CypherParser.T__3);
                    this.state = 1977;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1976;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1979;
                    this.oC_Expression();
                    this.state = 1981;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1980;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 1987;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            this.state = 1990;
            this.match(CypherParser.T__13);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_MapLiteral(): OC_MapLiteralContext {
        let localContext = new OC_MapLiteralContext(this.context, this.state);
        this.enterRule(localContext, 220, CypherParser.RULE_oC_MapLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1992;
            this.match(CypherParser.T__6);
            this.state = 1994;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1993;
                this.match(CypherParser.SP);
                }
            }

            this.state = 2029;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 4294967295) !== 0) || ((((_la - 78)) & ~0x1F) === 0 && ((1 << (_la - 78)) & 2147483647) !== 0) || ((((_la - 112)) & ~0x1F) === 0 && ((1 << (_la - 112)) & 167770113) !== 0)) {
                {
                this.state = 1996;
                this.oC_PropertyKeyName();
                this.state = 1998;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1997;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 2000;
                this.match(CypherParser.T__1);
                this.state = 2002;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 2001;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 2004;
                this.oC_Expression();
                this.state = 2006;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 2005;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 2026;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 4) {
                    {
                    {
                    this.state = 2008;
                    this.match(CypherParser.T__3);
                    this.state = 2010;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 2009;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 2012;
                    this.oC_PropertyKeyName();
                    this.state = 2014;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 2013;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 2016;
                    this.match(CypherParser.T__1);
                    this.state = 2018;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 2017;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 2020;
                    this.oC_Expression();
                    this.state = 2022;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 2021;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 2028;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            this.state = 2031;
            this.match(CypherParser.T__7);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_PropertyKeyName(): OC_PropertyKeyNameContext {
        let localContext = new OC_PropertyKeyNameContext(this.context, this.state);
        this.enterRule(localContext, 222, CypherParser.RULE_oC_PropertyKeyName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 2033;
            this.oC_SchemaName();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_Parameter(): OC_ParameterContext {
        let localContext = new OC_ParameterContext(this.context, this.state);
        this.enterRule(localContext, 224, CypherParser.RULE_oC_Parameter);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 2035;
            this.match(CypherParser.T__25);
            this.state = 2038;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.INDEX:
            case CypherParser.ASSERT:
            case CypherParser.FULLTEXT:
            case CypherParser.VECTOR:
            case CypherParser.OPTIONS:
            case CypherParser.LOAD:
            case CypherParser.CSV:
            case CypherParser.HEADERS:
            case CypherParser.FROM:
            case CypherParser.FIELDTERMINATOR:
            case CypherParser.REMOVE:
            case CypherParser.CALL:
            case CypherParser.YIELD:
            case CypherParser.SHORTESTPATH:
            case CypherParser.ALLSHORTESTPATHS:
            case CypherParser.COUNT:
            case CypherParser.ANY:
            case CypherParser.NONE:
            case CypherParser.SINGLE:
            case CypherParser.REDUCE:
            case CypherParser.EXISTS:
            case CypherParser.HexLetter:
            case CypherParser.DROP:
            case CypherParser.FILTER:
            case CypherParser.EXTRACT:
            case CypherParser.CYPHER:
            case CypherParser.UnescapedSymbolicName:
            case CypherParser.EscapedSymbolicName:
                {
                this.state = 2036;
                this.oC_SymbolicName();
                }
                break;
            case CypherParser.DecimalInteger:
                {
                this.state = 2037;
                this.match(CypherParser.DecimalInteger);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_SchemaName(): OC_SchemaNameContext {
        let localContext = new OC_SchemaNameContext(this.context, this.state);
        this.enterRule(localContext, 226, CypherParser.RULE_oC_SchemaName);
        try {
            this.state = 2042;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 378, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 2040;
                this.oC_SymbolicName();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 2041;
                this.oC_ReservedWord();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_ReservedWord(): OC_ReservedWordContext {
        let localContext = new OC_ReservedWordContext(this.context, this.state);
        this.enterRule(localContext, 228, CypherParser.RULE_oC_ReservedWord);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 2044;
            _la = this.tokenStream.LA(1);
            if(!(((((_la - 51)) & ~0x1F) === 0 && ((1 << (_la - 51)) & 4293394307) !== 0) || ((((_la - 83)) & ~0x1F) === 0 && ((1 << (_la - 83)) & 59236345) !== 0) || ((((_la - 123)) & ~0x1F) === 0 && ((1 << (_la - 123)) & 1023) !== 0))) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_SymbolicName(): OC_SymbolicNameContext {
        let localContext = new OC_SymbolicNameContext(this.context, this.state);
        this.enterRule(localContext, 230, CypherParser.RULE_oC_SymbolicName);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 2046;
            _la = this.tokenStream.LA(1);
            if(!(((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 58724255) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 276566019) !== 0) || ((((_la - 132)) & ~0x1F) === 0 && ((1 << (_la - 132)) & 159) !== 0))) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_ParameterHeader(): OC_ParameterHeaderContext {
        let localContext = new OC_ParameterHeaderContext(this.context, this.state);
        this.enterRule(localContext, 232, CypherParser.RULE_oC_ParameterHeader);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 2048;
            this.oC_SchemaName();
            this.state = 2050;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 2049;
                this.match(CypherParser.SP);
                }
            }

            this.state = 2052;
            this.match(CypherParser.T__8);
            this.state = 2054;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 2053;
                this.match(CypherParser.SP);
                }
            }

            this.state = 2056;
            this.oC_Expression();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_LeftArrowHead(): OC_LeftArrowHeadContext {
        let localContext = new OC_LeftArrowHeadContext(this.context, this.state);
        this.enterRule(localContext, 234, CypherParser.RULE_oC_LeftArrowHead);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 2058;
            _la = this.tokenStream.LA(1);
            if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 2013396992) !== 0))) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_RightArrowHead(): OC_RightArrowHeadContext {
        let localContext = new OC_RightArrowHeadContext(this.context, this.state);
        this.enterRule(localContext, 236, CypherParser.RULE_oC_RightArrowHead);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 2060;
            _la = this.tokenStream.LA(1);
            if(!(((((_la - 18)) & ~0x1F) === 0 && ((1 << (_la - 18)) & 122881) !== 0))) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public oC_Dash(): OC_DashContext {
        let localContext = new OC_DashContext(this.context, this.state);
        this.enterRule(localContext, 238, CypherParser.RULE_oC_Dash);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 2062;
            _la = this.tokenStream.LA(1);
            if(!(((((_la - 22)) & ~0x1F) === 0 && ((1 << (_la - 22)) & 16769025) !== 0))) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }

    public static readonly _serializedATN: number[] = [
        4,1,142,2065,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,
        7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,
        13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,7,17,2,18,7,18,2,19,7,19,2,
        20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,24,2,25,7,25,2,26,7,
        26,2,27,7,27,2,28,7,28,2,29,7,29,2,30,7,30,2,31,7,31,2,32,7,32,2,
        33,7,33,2,34,7,34,2,35,7,35,2,36,7,36,2,37,7,37,2,38,7,38,2,39,7,
        39,2,40,7,40,2,41,7,41,2,42,7,42,2,43,7,43,2,44,7,44,2,45,7,45,2,
        46,7,46,2,47,7,47,2,48,7,48,2,49,7,49,2,50,7,50,2,51,7,51,2,52,7,
        52,2,53,7,53,2,54,7,54,2,55,7,55,2,56,7,56,2,57,7,57,2,58,7,58,2,
        59,7,59,2,60,7,60,2,61,7,61,2,62,7,62,2,63,7,63,2,64,7,64,2,65,7,
        65,2,66,7,66,2,67,7,67,2,68,7,68,2,69,7,69,2,70,7,70,2,71,7,71,2,
        72,7,72,2,73,7,73,2,74,7,74,2,75,7,75,2,76,7,76,2,77,7,77,2,78,7,
        78,2,79,7,79,2,80,7,80,2,81,7,81,2,82,7,82,2,83,7,83,2,84,7,84,2,
        85,7,85,2,86,7,86,2,87,7,87,2,88,7,88,2,89,7,89,2,90,7,90,2,91,7,
        91,2,92,7,92,2,93,7,93,2,94,7,94,2,95,7,95,2,96,7,96,2,97,7,97,2,
        98,7,98,2,99,7,99,2,100,7,100,2,101,7,101,2,102,7,102,2,103,7,103,
        2,104,7,104,2,105,7,105,2,106,7,106,2,107,7,107,2,108,7,108,2,109,
        7,109,2,110,7,110,2,111,7,111,2,112,7,112,2,113,7,113,2,114,7,114,
        2,115,7,115,2,116,7,116,2,117,7,117,2,118,7,118,2,119,7,119,1,0,
        3,0,242,8,0,1,0,1,0,1,0,1,0,1,0,5,0,249,8,0,10,0,12,0,252,9,0,1,
        0,1,0,3,0,256,8,0,1,0,1,0,3,0,260,8,0,1,0,3,0,263,8,0,1,0,3,0,266,
        8,0,1,0,1,0,1,1,1,1,1,2,1,2,1,2,3,2,275,8,2,1,3,1,3,1,3,1,3,3,3,
        281,8,3,1,4,1,4,1,4,1,4,1,4,1,4,3,4,289,8,4,1,4,1,4,3,4,293,8,4,
        1,4,1,4,3,4,297,8,4,1,4,1,4,3,4,301,8,4,1,4,1,4,3,4,305,8,4,1,4,
        1,4,3,4,309,8,4,1,4,3,4,312,8,4,1,4,1,4,1,4,1,4,3,4,318,8,4,1,4,
        1,4,3,4,322,8,4,1,4,1,4,3,4,326,8,4,1,4,1,4,3,4,330,8,4,1,4,1,4,
        1,4,1,4,1,4,1,4,3,4,338,8,4,1,4,1,4,3,4,342,8,4,1,4,1,4,3,4,346,
        8,4,1,4,1,4,3,4,350,8,4,1,4,1,4,3,4,354,8,4,1,5,1,5,1,5,1,5,1,5,
        1,5,3,5,362,8,5,1,5,1,5,3,5,366,8,5,1,5,1,5,3,5,370,8,5,1,5,1,5,
        3,5,374,8,5,1,5,1,5,1,5,1,5,1,5,1,5,3,5,382,8,5,1,5,1,5,3,5,386,
        8,5,1,5,1,5,3,5,390,8,5,1,5,1,5,3,5,394,8,5,1,5,1,5,1,5,1,5,1,5,
        1,5,3,5,402,8,5,1,5,1,5,3,5,406,8,5,1,5,1,5,3,5,410,8,5,1,5,1,5,
        3,5,414,8,5,1,5,1,5,3,5,418,8,5,1,6,1,6,1,7,1,7,3,7,424,8,7,1,8,
        1,8,3,8,428,8,8,1,8,1,8,3,8,432,8,8,1,8,1,8,3,8,436,8,8,1,8,5,8,
        439,8,8,10,8,12,8,442,9,8,1,8,3,8,445,8,8,1,8,1,8,1,9,1,9,1,9,1,
        9,1,9,1,9,3,9,455,8,9,1,9,1,9,1,9,1,9,1,9,1,9,3,9,463,8,9,1,9,1,
        9,3,9,467,8,9,1,9,5,9,470,8,9,10,9,12,9,473,9,9,1,9,1,9,3,9,477,
        8,9,1,10,1,10,1,10,1,10,1,10,1,10,3,10,485,8,10,1,10,1,10,1,10,1,
        10,1,10,1,10,3,10,493,8,10,1,10,1,10,3,10,497,8,10,1,10,5,10,500,
        8,10,10,10,12,10,503,9,10,1,10,1,10,3,10,507,8,10,1,11,1,11,1,11,
        1,11,1,11,1,11,1,11,1,11,3,11,517,8,11,1,12,1,12,3,12,521,8,12,1,
        12,5,12,524,8,12,10,12,12,12,527,9,12,1,13,1,13,1,13,1,13,3,13,533,
        8,13,1,13,1,13,1,13,3,13,538,8,13,1,13,3,13,541,8,13,1,14,1,14,3,
        14,545,8,14,1,15,1,15,3,15,549,8,15,5,15,551,8,15,10,15,12,15,554,
        9,15,1,15,1,15,1,15,3,15,559,8,15,5,15,561,8,15,10,15,12,15,564,
        9,15,1,15,1,15,3,15,568,8,15,1,15,5,15,571,8,15,10,15,12,15,574,
        9,15,1,15,3,15,577,8,15,1,15,3,15,580,8,15,3,15,582,8,15,1,16,1,
        16,3,16,586,8,16,5,16,588,8,16,10,16,12,16,591,9,16,1,16,1,16,3,
        16,595,8,16,5,16,597,8,16,10,16,12,16,600,9,16,1,16,1,16,3,16,604,
        8,16,4,16,606,8,16,11,16,12,16,607,1,16,1,16,1,17,1,17,1,17,1,17,
        1,17,1,17,1,17,3,17,619,8,17,1,18,1,18,1,18,1,18,1,18,3,18,626,8,
        18,1,19,1,19,1,19,1,19,1,19,1,19,1,19,3,19,635,8,19,1,19,1,19,1,
        19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,3,19,649,8,19,1,
        20,1,20,3,20,653,8,20,1,20,1,20,3,20,657,8,20,1,20,1,20,1,20,1,20,
        1,20,1,20,3,20,665,8,20,1,20,1,20,3,20,669,8,20,1,20,4,20,672,8,
        20,11,20,12,20,673,1,20,3,20,677,8,20,1,20,1,20,1,21,1,21,3,21,683,
        8,21,1,21,1,21,3,21,687,8,21,1,21,1,21,3,21,691,8,21,1,21,1,21,1,
        22,1,22,3,22,697,8,22,1,22,1,22,3,22,701,8,22,1,22,1,22,3,22,705,
        8,22,1,22,3,22,708,8,22,1,23,1,23,3,23,712,8,23,1,23,1,23,1,23,1,
        23,1,23,1,23,1,24,1,24,3,24,722,8,24,1,24,1,24,1,24,5,24,727,8,24,
        10,24,12,24,730,9,24,1,25,1,25,1,25,1,25,1,25,1,25,1,25,1,25,1,25,
        1,25,3,25,742,8,25,1,26,1,26,3,26,746,8,26,1,26,1,26,1,27,1,27,3,
        27,752,8,27,1,27,1,27,3,27,756,8,27,1,27,1,27,3,27,760,8,27,1,27,
        5,27,763,8,27,10,27,12,27,766,9,27,1,28,1,28,3,28,770,8,28,1,28,
        1,28,3,28,774,8,28,1,28,1,28,1,28,1,28,3,28,780,8,28,1,28,1,28,3,
        28,784,8,28,1,28,1,28,1,28,1,28,3,28,790,8,28,1,28,1,28,3,28,794,
        8,28,1,28,1,28,1,28,1,28,3,28,800,8,28,1,28,1,28,3,28,804,8,28,1,
        29,1,29,3,29,808,8,29,1,29,1,29,3,29,812,8,29,1,29,1,29,3,29,816,
        8,29,1,29,1,29,3,29,820,8,29,1,29,5,29,823,8,29,10,29,12,29,826,
        9,29,1,30,1,30,1,30,1,30,3,30,832,8,30,1,30,1,30,3,30,836,8,30,1,
        30,5,30,839,8,30,10,30,12,30,842,9,30,1,31,1,31,1,31,1,31,3,31,848,
        8,31,1,32,1,32,1,32,1,32,3,32,854,8,32,1,32,1,32,1,32,3,32,859,8,
        32,1,33,1,33,1,33,1,33,3,33,865,8,33,1,33,3,33,868,8,33,1,33,1,33,
        1,33,1,33,3,33,874,8,33,3,33,876,8,33,1,34,1,34,3,34,880,8,34,1,
        34,1,34,3,34,884,8,34,1,34,5,34,887,8,34,10,34,12,34,890,9,34,1,
        34,3,34,893,8,34,1,34,3,34,896,8,34,1,35,1,35,1,35,1,35,1,35,3,35,
        903,8,35,1,35,1,35,1,36,1,36,1,36,3,36,910,8,36,1,36,3,36,913,8,
        36,1,37,1,37,1,37,1,38,3,38,919,8,38,1,38,3,38,922,8,38,1,38,1,38,
        1,38,1,38,3,38,928,8,38,1,38,1,38,3,38,932,8,38,1,38,1,38,3,38,936,
        8,38,1,39,1,39,3,39,940,8,39,1,39,1,39,3,39,944,8,39,1,39,5,39,947,
        8,39,10,39,12,39,950,9,39,1,39,1,39,3,39,954,8,39,1,39,1,39,3,39,
        958,8,39,1,39,5,39,961,8,39,10,39,12,39,964,9,39,3,39,966,8,39,1,
        40,1,40,1,40,1,40,1,40,1,40,1,40,1,40,3,40,976,8,40,1,40,3,40,979,
        8,40,3,40,981,8,40,1,41,1,41,3,41,985,8,41,1,41,1,41,3,41,989,8,
        41,1,41,1,41,3,41,993,8,41,1,41,5,41,996,8,41,10,41,12,41,999,9,
        41,3,41,1001,8,41,1,41,3,41,1004,8,41,1,41,1,41,1,42,1,42,3,42,1010,
        8,42,1,42,1,42,1,42,3,42,1015,8,42,1,42,1,42,1,42,3,42,1020,8,42,
        1,42,1,42,3,42,1024,8,42,1,42,1,42,1,42,3,42,1029,8,42,1,43,1,43,
        1,43,1,43,1,43,1,43,1,43,3,43,1038,8,43,1,43,5,43,1041,8,43,10,43,
        12,43,1044,9,43,1,44,1,44,1,44,1,44,1,45,1,45,1,45,1,45,1,46,1,46,
        3,46,1056,8,46,1,46,3,46,1059,8,46,1,47,1,47,1,47,1,47,1,48,1,48,
        3,48,1067,8,48,1,48,1,48,3,48,1071,8,48,1,48,5,48,1074,8,48,10,48,
        12,48,1077,9,48,1,49,1,49,3,49,1081,8,49,1,49,1,49,3,49,1085,8,49,
        1,49,1,49,1,49,3,49,1090,8,49,1,50,1,50,3,50,1094,8,50,1,51,1,51,
        3,51,1098,8,51,1,51,1,51,3,51,1102,8,51,1,51,1,51,3,51,1106,8,51,
        1,51,1,51,1,52,1,52,3,52,1112,8,52,1,52,5,52,1115,8,52,10,52,12,
        52,1118,9,52,1,52,1,52,1,52,1,52,3,52,1124,8,52,1,53,1,53,3,53,1128,
        8,53,1,53,4,53,1131,8,53,11,53,12,53,1132,1,54,1,54,3,54,1137,8,
        54,1,54,1,54,3,54,1141,8,54,3,54,1143,8,54,1,54,1,54,3,54,1147,8,
        54,3,54,1149,8,54,1,54,1,54,3,54,1153,8,54,3,54,1155,8,54,1,54,1,
        54,1,55,1,55,3,55,1161,8,55,1,55,1,55,1,56,1,56,3,56,1167,8,56,1,
        56,1,56,3,56,1171,8,56,1,56,3,56,1174,8,56,1,56,3,56,1177,8,56,1,
        56,1,56,3,56,1181,8,56,1,56,1,56,1,56,1,56,3,56,1187,8,56,1,56,1,
        56,3,56,1191,8,56,1,56,3,56,1194,8,56,1,56,3,56,1197,8,56,1,56,1,
        56,1,56,1,56,3,56,1203,8,56,1,56,3,56,1206,8,56,1,56,3,56,1209,8,
        56,1,56,1,56,3,56,1213,8,56,1,56,1,56,1,56,1,56,3,56,1219,8,56,1,
        56,3,56,1222,8,56,1,56,3,56,1225,8,56,1,56,1,56,3,56,1229,8,56,1,
        57,1,57,3,57,1233,8,57,1,57,1,57,3,57,1237,8,57,3,57,1239,8,57,1,
        57,1,57,3,57,1243,8,57,3,57,1245,8,57,1,57,3,57,1248,8,57,1,57,1,
        57,3,57,1252,8,57,3,57,1254,8,57,1,57,1,57,1,58,1,58,3,58,1260,8,
        58,1,59,1,59,3,59,1264,8,59,1,59,1,59,3,59,1268,8,59,1,59,1,59,3,
        59,1272,8,59,1,59,3,59,1275,8,59,1,59,5,59,1278,8,59,10,59,12,59,
        1281,9,59,1,60,1,60,3,60,1285,8,60,1,60,5,60,1288,8,60,10,60,12,
        60,1291,9,60,1,61,1,61,3,61,1295,8,61,1,61,1,61,1,62,1,62,3,62,1301,
        8,62,1,62,1,62,3,62,1305,8,62,3,62,1307,8,62,1,62,1,62,3,62,1311,
        8,62,1,62,1,62,3,62,1315,8,62,3,62,1317,8,62,3,62,1319,8,62,1,63,
        1,63,1,64,1,64,1,65,1,65,3,65,1327,8,65,1,65,4,65,1330,8,65,11,65,
        12,65,1331,1,66,1,66,1,67,1,67,1,67,1,67,1,67,5,67,1341,8,67,10,
        67,12,67,1344,9,67,1,68,1,68,1,68,1,68,1,68,5,68,1351,8,68,10,68,
        12,68,1354,9,68,1,69,1,69,1,69,1,69,1,69,5,69,1361,8,69,10,69,12,
        69,1364,9,69,1,70,1,70,3,70,1368,8,70,5,70,1370,8,70,10,70,12,70,
        1373,9,70,1,70,1,70,1,71,1,71,3,71,1379,8,71,1,71,5,71,1382,8,71,
        10,71,12,71,1385,9,71,1,72,1,72,3,72,1389,8,72,1,72,1,72,1,72,3,
        72,1394,8,72,1,72,1,72,1,72,3,72,1399,8,72,1,72,1,72,1,72,3,72,1404,
        8,72,1,72,1,72,1,72,3,72,1409,8,72,1,72,1,72,1,72,3,72,1414,8,72,
        1,72,3,72,1417,8,72,1,73,1,73,1,73,1,73,5,73,1423,8,73,10,73,12,
        73,1426,9,73,1,74,1,74,1,74,1,74,1,74,1,74,1,74,1,74,1,74,1,74,3,
        74,1438,8,74,1,74,3,74,1441,8,74,1,74,1,74,1,75,1,75,1,75,3,75,1448,
        8,75,1,75,1,75,1,76,1,76,1,76,1,76,1,76,1,76,1,76,1,76,1,76,1,76,
        3,76,1462,8,76,1,77,1,77,3,77,1466,8,77,1,77,1,77,3,77,1470,8,77,
        1,77,1,77,3,77,1474,8,77,1,77,1,77,3,77,1478,8,77,1,77,5,77,1481,
        8,77,10,77,12,77,1484,9,77,1,78,1,78,3,78,1488,8,78,1,78,1,78,3,
        78,1492,8,78,1,78,1,78,3,78,1496,8,78,1,78,1,78,3,78,1500,8,78,1,
        78,1,78,3,78,1504,8,78,1,78,1,78,3,78,1508,8,78,1,78,5,78,1511,8,
        78,10,78,12,78,1514,9,78,1,79,1,79,3,79,1518,8,79,1,79,1,79,3,79,
        1522,8,79,1,79,5,79,1525,8,79,10,79,12,79,1528,9,79,1,80,1,80,1,
        80,3,80,1533,8,80,1,80,3,80,1536,8,80,1,81,1,81,3,81,1540,8,81,1,
        81,1,81,3,81,1544,8,81,1,81,5,81,1547,8,81,10,81,12,81,1550,9,81,
        1,81,3,81,1553,8,81,1,81,3,81,1556,8,81,1,82,1,82,1,82,1,82,1,82,
        1,82,3,82,1564,8,82,1,82,1,82,3,82,1568,8,82,1,82,3,82,1571,8,82,
        1,83,1,83,3,83,1575,8,83,1,83,1,83,1,84,1,84,1,84,1,84,1,84,3,84,
        1584,8,84,1,84,1,84,3,84,1588,8,84,1,84,1,84,3,84,1592,8,84,1,84,
        1,84,1,84,1,84,1,84,1,84,1,84,1,84,1,84,1,84,1,84,3,84,1605,8,84,
        1,85,1,85,3,85,1609,8,85,1,85,4,85,1612,8,85,11,85,12,85,1613,1,
        85,1,85,3,85,1618,8,85,1,85,1,85,3,85,1622,8,85,1,85,4,85,1625,8,
        85,11,85,12,85,1626,3,85,1629,8,85,1,85,3,85,1632,8,85,1,85,1,85,
        3,85,1636,8,85,1,85,3,85,1639,8,85,1,85,3,85,1642,8,85,1,85,1,85,
        1,86,1,86,3,86,1648,8,86,1,86,1,86,3,86,1652,8,86,1,86,1,86,3,86,
        1656,8,86,1,86,1,86,1,87,1,87,3,87,1662,8,87,1,87,1,87,3,87,1666,
        8,87,1,87,1,87,3,87,1670,8,87,1,87,3,87,1673,8,87,1,87,3,87,1676,
        8,87,1,87,1,87,1,88,1,88,3,88,1682,8,88,1,88,1,88,3,88,1686,8,88,
        1,88,1,88,3,88,1690,8,88,3,88,1692,8,88,1,88,1,88,3,88,1696,8,88,
        1,88,1,88,3,88,1700,8,88,3,88,1702,8,88,1,88,1,88,3,88,1706,8,88,
        1,88,1,88,3,88,1710,8,88,1,88,1,88,1,89,1,89,3,89,1716,8,89,1,89,
        1,89,3,89,1720,8,89,1,89,1,89,3,89,1724,8,89,1,89,1,89,1,89,1,89,
        3,89,1730,8,89,1,89,1,89,3,89,1734,8,89,1,89,1,89,3,89,1738,8,89,
        1,89,1,89,1,89,1,89,3,89,1744,8,89,1,89,1,89,3,89,1748,8,89,1,89,
        1,89,3,89,1752,8,89,1,89,1,89,1,89,1,89,3,89,1758,8,89,1,89,1,89,
        3,89,1762,8,89,1,89,1,89,3,89,1766,8,89,1,89,1,89,3,89,1770,8,89,
        1,90,1,90,3,90,1774,8,90,1,90,3,90,1777,8,90,1,91,1,91,1,92,1,92,
        3,92,1783,8,92,1,92,1,92,3,92,1787,8,92,1,92,1,92,1,93,1,93,1,93,
        1,93,1,93,1,93,1,94,1,94,3,94,1799,8,94,1,94,1,94,3,94,1803,8,94,
        1,94,1,94,3,94,1807,8,94,1,94,1,94,3,94,1811,8,94,1,94,1,94,3,94,
        1815,8,94,1,94,1,94,3,94,1819,8,94,1,94,1,94,3,94,1823,8,94,1,94,
        1,94,3,94,1827,8,94,1,94,1,94,3,94,1831,8,94,1,94,1,94,1,95,1,95,
        3,95,1837,8,95,1,95,1,95,3,95,1841,8,95,1,95,1,95,3,95,1845,8,95,
        3,95,1847,8,95,1,95,1,95,3,95,1851,8,95,1,95,1,95,3,95,1855,8,95,
        1,95,1,95,3,95,1859,8,95,5,95,1861,8,95,10,95,12,95,1864,9,95,3,
        95,1866,8,95,1,95,1,95,1,96,1,96,1,96,1,97,1,97,3,97,1875,8,97,1,
        97,1,97,3,97,1879,8,97,1,97,1,97,1,97,3,97,1884,8,97,4,97,1886,8,
        97,11,97,12,97,1887,1,97,1,97,3,97,1892,8,97,1,97,3,97,1895,8,97,
        3,97,1897,8,97,1,97,3,97,1900,8,97,1,97,1,97,1,98,1,98,3,98,1906,
        8,98,1,98,1,98,3,98,1910,8,98,1,98,1,98,3,98,1914,8,98,1,98,1,98,
        3,98,1918,8,98,1,98,1,98,3,98,1922,8,98,5,98,1924,8,98,10,98,12,
        98,1927,9,98,3,98,1929,8,98,1,98,1,98,1,99,1,99,1,100,1,100,1,101,
        1,101,1,101,1,102,1,102,1,102,5,102,1943,8,102,10,102,12,102,1946,
        9,102,1,103,1,103,1,104,1,104,1,104,1,104,1,104,1,104,3,104,1956,
        8,104,1,105,1,105,1,106,1,106,3,106,1962,8,106,1,107,1,107,1,108,
        1,108,1,109,1,109,3,109,1970,8,109,1,109,1,109,3,109,1974,8,109,
        1,109,1,109,3,109,1978,8,109,1,109,1,109,3,109,1982,8,109,5,109,
        1984,8,109,10,109,12,109,1987,9,109,3,109,1989,8,109,1,109,1,109,
        1,110,1,110,3,110,1995,8,110,1,110,1,110,3,110,1999,8,110,1,110,
        1,110,3,110,2003,8,110,1,110,1,110,3,110,2007,8,110,1,110,1,110,
        3,110,2011,8,110,1,110,1,110,3,110,2015,8,110,1,110,1,110,3,110,
        2019,8,110,1,110,1,110,3,110,2023,8,110,5,110,2025,8,110,10,110,
        12,110,2028,9,110,3,110,2030,8,110,1,110,1,110,1,111,1,111,1,112,
        1,112,1,112,3,112,2039,8,112,1,113,1,113,3,113,2043,8,113,1,114,
        1,114,1,115,1,115,1,116,1,116,3,116,2051,8,116,1,116,1,116,3,116,
        2055,8,116,1,116,1,116,1,117,1,117,1,118,1,118,1,119,1,119,1,119,
        0,0,120,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,
        42,44,46,48,50,52,54,56,58,60,62,64,66,68,70,72,74,76,78,80,82,84,
        86,88,90,92,94,96,98,100,102,104,106,108,110,112,114,116,118,120,
        122,124,126,128,130,132,134,136,138,140,142,144,146,148,150,152,
        154,156,158,160,162,164,166,168,170,172,174,176,178,180,182,184,
        186,188,190,192,194,196,198,200,202,204,206,208,210,212,214,216,
        218,220,222,224,226,228,230,232,234,236,238,0,12,1,0,48,49,1,0,79,
        82,1,0,84,85,1,0,21,22,1,0,107,108,1,0,109,111,1,0,119,120,7,0,51,
        52,58,69,72,83,86,95,97,101,106,108,123,132,9,0,46,50,53,57,69,71,
        84,85,96,96,102,106,112,112,132,136,139,139,2,0,17,17,27,30,2,0,
        18,18,31,34,2,0,22,22,35,45,2370,0,241,1,0,0,0,2,269,1,0,0,0,4,274,
        1,0,0,0,6,280,1,0,0,0,8,353,1,0,0,0,10,417,1,0,0,0,12,419,1,0,0,
        0,14,423,1,0,0,0,16,425,1,0,0,0,18,448,1,0,0,0,20,478,1,0,0,0,22,
        516,1,0,0,0,24,518,1,0,0,0,26,540,1,0,0,0,28,544,1,0,0,0,30,581,
        1,0,0,0,32,605,1,0,0,0,34,618,1,0,0,0,36,625,1,0,0,0,38,627,1,0,
        0,0,40,650,1,0,0,0,42,680,1,0,0,0,44,696,1,0,0,0,46,709,1,0,0,0,
        48,719,1,0,0,0,50,741,1,0,0,0,52,743,1,0,0,0,54,749,1,0,0,0,56,803,
        1,0,0,0,58,807,1,0,0,0,60,827,1,0,0,0,62,847,1,0,0,0,64,849,1,0,
        0,0,66,860,1,0,0,0,68,877,1,0,0,0,70,902,1,0,0,0,72,906,1,0,0,0,
        74,914,1,0,0,0,76,921,1,0,0,0,78,965,1,0,0,0,80,980,1,0,0,0,82,982,
        1,0,0,0,84,1028,1,0,0,0,86,1030,1,0,0,0,88,1045,1,0,0,0,90,1049,
        1,0,0,0,92,1053,1,0,0,0,94,1060,1,0,0,0,96,1064,1,0,0,0,98,1089,
        1,0,0,0,100,1093,1,0,0,0,102,1095,1,0,0,0,104,1123,1,0,0,0,106,1125,
        1,0,0,0,108,1134,1,0,0,0,110,1158,1,0,0,0,112,1228,1,0,0,0,114,1230,
        1,0,0,0,116,1259,1,0,0,0,118,1261,1,0,0,0,120,1282,1,0,0,0,122,1292,
        1,0,0,0,124,1298,1,0,0,0,126,1320,1,0,0,0,128,1322,1,0,0,0,130,1324,
        1,0,0,0,132,1333,1,0,0,0,134,1335,1,0,0,0,136,1345,1,0,0,0,138,1355,
        1,0,0,0,140,1371,1,0,0,0,142,1376,1,0,0,0,144,1416,1,0,0,0,146,1418,
        1,0,0,0,148,1437,1,0,0,0,150,1444,1,0,0,0,152,1461,1,0,0,0,154,1463,
        1,0,0,0,156,1485,1,0,0,0,158,1515,1,0,0,0,160,1535,1,0,0,0,162,1537,
        1,0,0,0,164,1570,1,0,0,0,166,1572,1,0,0,0,168,1604,1,0,0,0,170,1628,
        1,0,0,0,172,1645,1,0,0,0,174,1659,1,0,0,0,176,1679,1,0,0,0,178,1769,
        1,0,0,0,180,1771,1,0,0,0,182,1778,1,0,0,0,184,1780,1,0,0,0,186,1790,
        1,0,0,0,188,1796,1,0,0,0,190,1834,1,0,0,0,192,1869,1,0,0,0,194,1872,
        1,0,0,0,196,1903,1,0,0,0,198,1932,1,0,0,0,200,1934,1,0,0,0,202,1936,
        1,0,0,0,204,1944,1,0,0,0,206,1947,1,0,0,0,208,1955,1,0,0,0,210,1957,
        1,0,0,0,212,1961,1,0,0,0,214,1963,1,0,0,0,216,1965,1,0,0,0,218,1967,
        1,0,0,0,220,1992,1,0,0,0,222,2033,1,0,0,0,224,2035,1,0,0,0,226,2042,
        1,0,0,0,228,2044,1,0,0,0,230,2046,1,0,0,0,232,2048,1,0,0,0,234,2058,
        1,0,0,0,236,2060,1,0,0,0,238,2062,1,0,0,0,240,242,5,140,0,0,241,
        240,1,0,0,0,241,242,1,0,0,0,242,255,1,0,0,0,243,244,5,135,0,0,244,
        245,5,140,0,0,245,250,3,232,116,0,246,247,5,140,0,0,247,249,3,232,
        116,0,248,246,1,0,0,0,249,252,1,0,0,0,250,248,1,0,0,0,250,251,1,
        0,0,0,251,253,1,0,0,0,252,250,1,0,0,0,253,254,5,140,0,0,254,256,
        1,0,0,0,255,243,1,0,0,0,255,256,1,0,0,0,256,257,1,0,0,0,257,262,
        3,2,1,0,258,260,5,140,0,0,259,258,1,0,0,0,259,260,1,0,0,0,260,261,
        1,0,0,0,261,263,5,1,0,0,262,259,1,0,0,0,262,263,1,0,0,0,263,265,
        1,0,0,0,264,266,5,140,0,0,265,264,1,0,0,0,265,266,1,0,0,0,266,267,
        1,0,0,0,267,268,5,0,0,1,268,1,1,0,0,0,269,270,3,4,2,0,270,3,1,0,
        0,0,271,275,3,24,12,0,272,275,3,66,33,0,273,275,3,6,3,0,274,271,
        1,0,0,0,274,272,1,0,0,0,274,273,1,0,0,0,275,5,1,0,0,0,276,281,3,
        8,4,0,277,281,3,10,5,0,278,281,3,18,9,0,279,281,3,20,10,0,280,276,
        1,0,0,0,280,277,1,0,0,0,280,278,1,0,0,0,280,279,1,0,0,0,281,7,1,
        0,0,0,282,283,5,65,0,0,283,284,5,140,0,0,284,285,3,12,6,0,285,286,
        5,140,0,0,286,288,5,46,0,0,287,289,5,140,0,0,288,287,1,0,0,0,288,
        289,1,0,0,0,289,290,1,0,0,0,290,292,5,125,0,0,291,293,5,140,0,0,
        292,291,1,0,0,0,292,293,1,0,0,0,293,294,1,0,0,0,294,296,3,14,7,0,
        295,297,5,140,0,0,296,295,1,0,0,0,296,297,1,0,0,0,297,298,1,0,0,
        0,298,300,5,64,0,0,299,301,5,140,0,0,300,299,1,0,0,0,300,301,1,0,
        0,0,301,302,1,0,0,0,302,311,3,16,8,0,303,305,5,140,0,0,304,303,1,
        0,0,0,304,305,1,0,0,0,305,306,1,0,0,0,306,308,5,50,0,0,307,309,5,
        140,0,0,308,307,1,0,0,0,308,309,1,0,0,0,309,310,1,0,0,0,310,312,
        3,220,110,0,311,304,1,0,0,0,311,312,1,0,0,0,312,354,1,0,0,0,313,
        314,5,65,0,0,314,315,5,140,0,0,315,317,5,46,0,0,316,318,5,140,0,
        0,317,316,1,0,0,0,317,318,1,0,0,0,318,319,1,0,0,0,319,321,5,125,
        0,0,320,322,5,140,0,0,321,320,1,0,0,0,321,322,1,0,0,0,322,323,1,
        0,0,0,323,325,3,14,7,0,324,326,5,140,0,0,325,324,1,0,0,0,325,326,
        1,0,0,0,326,327,1,0,0,0,327,329,5,64,0,0,328,330,5,140,0,0,329,328,
        1,0,0,0,329,330,1,0,0,0,330,331,1,0,0,0,331,332,3,16,8,0,332,354,
        1,0,0,0,333,334,5,65,0,0,334,335,5,140,0,0,335,337,5,46,0,0,336,
        338,5,140,0,0,337,336,1,0,0,0,337,338,1,0,0,0,338,339,1,0,0,0,339,
        341,5,64,0,0,340,342,5,140,0,0,341,340,1,0,0,0,341,342,1,0,0,0,342,
        343,1,0,0,0,343,345,5,2,0,0,344,346,5,140,0,0,345,344,1,0,0,0,345,
        346,1,0,0,0,346,347,1,0,0,0,347,349,3,126,63,0,348,350,5,140,0,0,
        349,348,1,0,0,0,349,350,1,0,0,0,350,351,1,0,0,0,351,352,3,16,8,0,
        352,354,1,0,0,0,353,282,1,0,0,0,353,313,1,0,0,0,353,333,1,0,0,0,
        354,9,1,0,0,0,355,356,5,132,0,0,356,357,5,140,0,0,357,358,3,12,6,
        0,358,359,5,140,0,0,359,361,5,46,0,0,360,362,5,140,0,0,361,360,1,
        0,0,0,361,362,1,0,0,0,362,363,1,0,0,0,363,365,5,125,0,0,364,366,
        5,140,0,0,365,364,1,0,0,0,365,366,1,0,0,0,366,367,1,0,0,0,367,369,
        3,14,7,0,368,370,5,140,0,0,369,368,1,0,0,0,369,370,1,0,0,0,370,371,
        1,0,0,0,371,373,5,64,0,0,372,374,5,140,0,0,373,372,1,0,0,0,373,374,
        1,0,0,0,374,375,1,0,0,0,375,376,3,16,8,0,376,418,1,0,0,0,377,378,
        5,132,0,0,378,379,5,140,0,0,379,381,5,46,0,0,380,382,5,140,0,0,381,
        380,1,0,0,0,381,382,1,0,0,0,382,383,1,0,0,0,383,385,5,125,0,0,384,
        386,5,140,0,0,385,384,1,0,0,0,385,386,1,0,0,0,386,387,1,0,0,0,387,
        389,3,14,7,0,388,390,5,140,0,0,389,388,1,0,0,0,389,390,1,0,0,0,390,
        391,1,0,0,0,391,393,5,64,0,0,392,394,5,140,0,0,393,392,1,0,0,0,393,
        394,1,0,0,0,394,395,1,0,0,0,395,396,3,16,8,0,396,418,1,0,0,0,397,
        398,5,132,0,0,398,399,5,140,0,0,399,401,5,46,0,0,400,402,5,140,0,
        0,401,400,1,0,0,0,401,402,1,0,0,0,402,403,1,0,0,0,403,405,5,64,0,
        0,404,406,5,140,0,0,405,404,1,0,0,0,405,406,1,0,0,0,406,407,1,0,
        0,0,407,409,5,2,0,0,408,410,5,140,0,0,409,408,1,0,0,0,409,410,1,
        0,0,0,410,411,1,0,0,0,411,413,3,126,63,0,412,414,5,140,0,0,413,412,
        1,0,0,0,413,414,1,0,0,0,414,415,1,0,0,0,415,416,3,16,8,0,416,418,
        1,0,0,0,417,355,1,0,0,0,417,377,1,0,0,0,417,397,1,0,0,0,418,11,1,
        0,0,0,419,420,7,0,0,0,420,13,1,0,0,0,421,424,3,108,54,0,422,424,
        3,106,53,0,423,421,1,0,0,0,423,422,1,0,0,0,424,15,1,0,0,0,425,427,
        5,3,0,0,426,428,5,140,0,0,427,426,1,0,0,0,427,428,1,0,0,0,428,429,
        1,0,0,0,429,440,3,132,66,0,430,432,5,140,0,0,431,430,1,0,0,0,431,
        432,1,0,0,0,432,433,1,0,0,0,433,435,5,4,0,0,434,436,5,140,0,0,435,
        434,1,0,0,0,435,436,1,0,0,0,436,437,1,0,0,0,437,439,3,132,66,0,438,
        431,1,0,0,0,439,442,1,0,0,0,440,438,1,0,0,0,440,441,1,0,0,0,441,
        444,1,0,0,0,442,440,1,0,0,0,443,445,5,140,0,0,444,443,1,0,0,0,444,
        445,1,0,0,0,445,446,1,0,0,0,446,447,5,5,0,0,447,17,1,0,0,0,448,449,
        5,65,0,0,449,450,5,140,0,0,450,451,5,123,0,0,451,452,5,140,0,0,452,
        454,5,64,0,0,453,455,5,140,0,0,454,453,1,0,0,0,454,455,1,0,0,0,455,
        456,1,0,0,0,456,457,3,14,7,0,457,458,5,140,0,0,458,459,5,47,0,0,
        459,460,5,140,0,0,460,471,3,132,66,0,461,463,5,140,0,0,462,461,1,
        0,0,0,462,463,1,0,0,0,463,464,1,0,0,0,464,466,5,4,0,0,465,467,5,
        140,0,0,466,465,1,0,0,0,466,467,1,0,0,0,467,468,1,0,0,0,468,470,
        3,132,66,0,469,462,1,0,0,0,470,473,1,0,0,0,471,469,1,0,0,0,471,472,
        1,0,0,0,472,476,1,0,0,0,473,471,1,0,0,0,474,475,5,140,0,0,475,477,
        3,22,11,0,476,474,1,0,0,0,476,477,1,0,0,0,477,19,1,0,0,0,478,479,
        5,132,0,0,479,480,5,140,0,0,480,481,5,123,0,0,481,482,5,140,0,0,
        482,484,5,64,0,0,483,485,5,140,0,0,484,483,1,0,0,0,484,485,1,0,0,
        0,485,486,1,0,0,0,486,487,3,14,7,0,487,488,5,140,0,0,488,489,5,47,
        0,0,489,490,5,140,0,0,490,501,3,132,66,0,491,493,5,140,0,0,492,491,
        1,0,0,0,492,493,1,0,0,0,493,494,1,0,0,0,494,496,5,4,0,0,495,497,
        5,140,0,0,496,495,1,0,0,0,496,497,1,0,0,0,497,498,1,0,0,0,498,500,
        3,132,66,0,499,492,1,0,0,0,500,503,1,0,0,0,501,499,1,0,0,0,501,502,
        1,0,0,0,502,506,1,0,0,0,503,501,1,0,0,0,504,505,5,140,0,0,505,507,
        3,22,11,0,506,504,1,0,0,0,506,507,1,0,0,0,507,21,1,0,0,0,508,509,
        5,94,0,0,509,510,5,140,0,0,510,517,5,127,0,0,511,512,5,94,0,0,512,
        513,5,140,0,0,513,514,5,89,0,0,514,515,5,140,0,0,515,517,5,95,0,
        0,516,508,1,0,0,0,516,511,1,0,0,0,517,23,1,0,0,0,518,525,3,28,14,
        0,519,521,5,140,0,0,520,519,1,0,0,0,520,521,1,0,0,0,521,522,1,0,
        0,0,522,524,3,26,13,0,523,520,1,0,0,0,524,527,1,0,0,0,525,523,1,
        0,0,0,525,526,1,0,0,0,526,25,1,0,0,0,527,525,1,0,0,0,528,529,5,51,
        0,0,529,530,5,140,0,0,530,532,5,52,0,0,531,533,5,140,0,0,532,531,
        1,0,0,0,532,533,1,0,0,0,533,534,1,0,0,0,534,541,3,28,14,0,535,537,
        5,51,0,0,536,538,5,140,0,0,537,536,1,0,0,0,537,538,1,0,0,0,538,539,
        1,0,0,0,539,541,3,28,14,0,540,528,1,0,0,0,540,535,1,0,0,0,541,27,
        1,0,0,0,542,545,3,30,15,0,543,545,3,32,16,0,544,542,1,0,0,0,544,
        543,1,0,0,0,545,29,1,0,0,0,546,548,3,36,18,0,547,549,5,140,0,0,548,
        547,1,0,0,0,548,549,1,0,0,0,549,551,1,0,0,0,550,546,1,0,0,0,551,
        554,1,0,0,0,552,550,1,0,0,0,552,553,1,0,0,0,553,555,1,0,0,0,554,
        552,1,0,0,0,555,582,3,74,37,0,556,558,3,36,18,0,557,559,5,140,0,
        0,558,557,1,0,0,0,558,559,1,0,0,0,559,561,1,0,0,0,560,556,1,0,0,
        0,561,564,1,0,0,0,562,560,1,0,0,0,562,563,1,0,0,0,563,565,1,0,0,
        0,564,562,1,0,0,0,565,572,3,34,17,0,566,568,5,140,0,0,567,566,1,
        0,0,0,567,568,1,0,0,0,568,569,1,0,0,0,569,571,3,34,17,0,570,567,
        1,0,0,0,571,574,1,0,0,0,572,570,1,0,0,0,572,573,1,0,0,0,573,579,
        1,0,0,0,574,572,1,0,0,0,575,577,5,140,0,0,576,575,1,0,0,0,576,577,
        1,0,0,0,577,578,1,0,0,0,578,580,3,74,37,0,579,576,1,0,0,0,579,580,
        1,0,0,0,580,582,1,0,0,0,581,552,1,0,0,0,581,562,1,0,0,0,582,31,1,
        0,0,0,583,585,3,36,18,0,584,586,5,140,0,0,585,584,1,0,0,0,585,586,
        1,0,0,0,586,588,1,0,0,0,587,583,1,0,0,0,588,591,1,0,0,0,589,587,
        1,0,0,0,589,590,1,0,0,0,590,598,1,0,0,0,591,589,1,0,0,0,592,594,
        3,34,17,0,593,595,5,140,0,0,594,593,1,0,0,0,594,595,1,0,0,0,595,
        597,1,0,0,0,596,592,1,0,0,0,597,600,1,0,0,0,598,596,1,0,0,0,598,
        599,1,0,0,0,599,601,1,0,0,0,600,598,1,0,0,0,601,603,3,72,36,0,602,
        604,5,140,0,0,603,602,1,0,0,0,603,604,1,0,0,0,604,606,1,0,0,0,605,
        589,1,0,0,0,606,607,1,0,0,0,607,605,1,0,0,0,607,608,1,0,0,0,608,
        609,1,0,0,0,609,610,3,30,15,0,610,33,1,0,0,0,611,619,3,52,26,0,612,
        619,3,48,24,0,613,619,3,58,29,0,614,619,3,54,27,0,615,619,3,60,30,
        0,616,619,3,40,20,0,617,619,3,42,21,0,618,611,1,0,0,0,618,612,1,
        0,0,0,618,613,1,0,0,0,618,614,1,0,0,0,618,615,1,0,0,0,618,616,1,
        0,0,0,618,617,1,0,0,0,619,35,1,0,0,0,620,626,3,44,22,0,621,626,3,
        46,23,0,622,626,3,64,32,0,623,626,3,42,21,0,624,626,3,38,19,0,625,
        620,1,0,0,0,625,621,1,0,0,0,625,622,1,0,0,0,625,623,1,0,0,0,625,
        624,1,0,0,0,626,37,1,0,0,0,627,628,5,53,0,0,628,629,5,140,0,0,629,
        634,5,54,0,0,630,631,5,140,0,0,631,632,5,72,0,0,632,633,5,140,0,
        0,633,635,5,55,0,0,634,630,1,0,0,0,634,635,1,0,0,0,635,636,1,0,0,
        0,636,637,5,140,0,0,637,638,5,56,0,0,638,639,5,140,0,0,639,640,3,
        132,66,0,640,641,5,140,0,0,641,642,5,62,0,0,642,643,5,140,0,0,643,
        648,3,206,103,0,644,645,5,140,0,0,645,646,5,57,0,0,646,647,5,140,
        0,0,647,649,5,121,0,0,648,644,1,0,0,0,648,649,1,0,0,0,649,39,1,0,
        0,0,650,652,5,58,0,0,651,653,5,140,0,0,652,651,1,0,0,0,652,653,1,
        0,0,0,653,654,1,0,0,0,654,656,5,3,0,0,655,657,5,140,0,0,656,655,
        1,0,0,0,656,657,1,0,0,0,657,658,1,0,0,0,658,659,3,206,103,0,659,
        660,5,140,0,0,660,661,5,93,0,0,661,662,5,140,0,0,662,664,3,132,66,
        0,663,665,5,140,0,0,664,663,1,0,0,0,664,665,1,0,0,0,665,666,1,0,
        0,0,666,671,5,6,0,0,667,669,5,140,0,0,668,667,1,0,0,0,668,669,1,
        0,0,0,669,670,1,0,0,0,670,672,3,34,17,0,671,668,1,0,0,0,672,673,
        1,0,0,0,673,671,1,0,0,0,673,674,1,0,0,0,674,676,1,0,0,0,675,677,
        5,140,0,0,676,675,1,0,0,0,676,677,1,0,0,0,677,678,1,0,0,0,678,679,
        5,5,0,0,679,41,1,0,0,0,680,682,5,70,0,0,681,683,5,140,0,0,682,681,
        1,0,0,0,682,683,1,0,0,0,683,684,1,0,0,0,684,686,5,7,0,0,685,687,
        5,140,0,0,686,685,1,0,0,0,686,687,1,0,0,0,687,688,1,0,0,0,688,690,
        3,24,12,0,689,691,5,140,0,0,690,689,1,0,0,0,690,691,1,0,0,0,691,
        692,1,0,0,0,692,693,5,8,0,0,693,43,1,0,0,0,694,695,5,59,0,0,695,
        697,5,140,0,0,696,694,1,0,0,0,696,697,1,0,0,0,697,698,1,0,0,0,698,
        700,5,60,0,0,699,701,5,140,0,0,700,699,1,0,0,0,700,701,1,0,0,0,701,
        702,1,0,0,0,702,707,3,96,48,0,703,705,5,140,0,0,704,703,1,0,0,0,
        704,705,1,0,0,0,705,706,1,0,0,0,706,708,3,94,47,0,707,704,1,0,0,
        0,707,708,1,0,0,0,708,45,1,0,0,0,709,711,5,61,0,0,710,712,5,140,
        0,0,711,710,1,0,0,0,711,712,1,0,0,0,712,713,1,0,0,0,713,714,3,132,
        66,0,714,715,5,140,0,0,715,716,5,62,0,0,716,717,5,140,0,0,717,718,
        3,206,103,0,718,47,1,0,0,0,719,721,5,63,0,0,720,722,5,140,0,0,721,
        720,1,0,0,0,721,722,1,0,0,0,722,723,1,0,0,0,723,728,3,98,49,0,724,
        725,5,140,0,0,725,727,3,50,25,0,726,724,1,0,0,0,727,730,1,0,0,0,
        728,726,1,0,0,0,728,729,1,0,0,0,729,49,1,0,0,0,730,728,1,0,0,0,731,
        732,5,64,0,0,732,733,5,140,0,0,733,734,5,60,0,0,734,735,5,140,0,
        0,735,742,3,54,27,0,736,737,5,64,0,0,737,738,5,140,0,0,738,739,5,
        65,0,0,739,740,5,140,0,0,740,742,3,54,27,0,741,731,1,0,0,0,741,736,
        1,0,0,0,742,51,1,0,0,0,743,745,5,65,0,0,744,746,5,140,0,0,745,744,
        1,0,0,0,745,746,1,0,0,0,746,747,1,0,0,0,747,748,3,96,48,0,748,53,
        1,0,0,0,749,751,5,66,0,0,750,752,5,140,0,0,751,750,1,0,0,0,751,752,
        1,0,0,0,752,753,1,0,0,0,753,764,3,56,28,0,754,756,5,140,0,0,755,
        754,1,0,0,0,755,756,1,0,0,0,756,757,1,0,0,0,757,759,5,4,0,0,758,
        760,5,140,0,0,759,758,1,0,0,0,759,760,1,0,0,0,760,761,1,0,0,0,761,
        763,3,56,28,0,762,755,1,0,0,0,763,766,1,0,0,0,764,762,1,0,0,0,764,
        765,1,0,0,0,765,55,1,0,0,0,766,764,1,0,0,0,767,769,3,130,65,0,768,
        770,5,140,0,0,769,768,1,0,0,0,769,770,1,0,0,0,770,771,1,0,0,0,771,
        773,5,9,0,0,772,774,5,140,0,0,773,772,1,0,0,0,773,774,1,0,0,0,774,
        775,1,0,0,0,775,776,3,132,66,0,776,804,1,0,0,0,777,779,3,206,103,
        0,778,780,5,140,0,0,779,778,1,0,0,0,779,780,1,0,0,0,780,781,1,0,
        0,0,781,783,5,9,0,0,782,784,5,140,0,0,783,782,1,0,0,0,783,784,1,
        0,0,0,784,785,1,0,0,0,785,786,3,132,66,0,786,804,1,0,0,0,787,789,
        3,206,103,0,788,790,5,140,0,0,789,788,1,0,0,0,789,790,1,0,0,0,790,
        791,1,0,0,0,791,793,5,10,0,0,792,794,5,140,0,0,793,792,1,0,0,0,793,
        794,1,0,0,0,794,795,1,0,0,0,795,796,3,132,66,0,796,804,1,0,0,0,797,
        799,3,206,103,0,798,800,5,140,0,0,799,798,1,0,0,0,799,800,1,0,0,
        0,800,801,1,0,0,0,801,802,3,120,60,0,802,804,1,0,0,0,803,767,1,0,
        0,0,803,777,1,0,0,0,803,787,1,0,0,0,803,797,1,0,0,0,804,57,1,0,0,
        0,805,806,5,67,0,0,806,808,5,140,0,0,807,805,1,0,0,0,807,808,1,0,
        0,0,808,809,1,0,0,0,809,811,5,68,0,0,810,812,5,140,0,0,811,810,1,
        0,0,0,811,812,1,0,0,0,812,813,1,0,0,0,813,824,3,132,66,0,814,816,
        5,140,0,0,815,814,1,0,0,0,815,816,1,0,0,0,816,817,1,0,0,0,817,819,
        5,4,0,0,818,820,5,140,0,0,819,818,1,0,0,0,819,820,1,0,0,0,820,821,
        1,0,0,0,821,823,3,132,66,0,822,815,1,0,0,0,823,826,1,0,0,0,824,822,
        1,0,0,0,824,825,1,0,0,0,825,59,1,0,0,0,826,824,1,0,0,0,827,828,5,
        69,0,0,828,829,5,140,0,0,829,840,3,62,31,0,830,832,5,140,0,0,831,
        830,1,0,0,0,831,832,1,0,0,0,832,833,1,0,0,0,833,835,5,4,0,0,834,
        836,5,140,0,0,835,834,1,0,0,0,835,836,1,0,0,0,836,837,1,0,0,0,837,
        839,3,62,31,0,838,831,1,0,0,0,839,842,1,0,0,0,840,838,1,0,0,0,840,
        841,1,0,0,0,841,61,1,0,0,0,842,840,1,0,0,0,843,844,3,206,103,0,844,
        845,3,120,60,0,845,848,1,0,0,0,846,848,3,130,65,0,847,843,1,0,0,
        0,847,846,1,0,0,0,848,63,1,0,0,0,849,850,5,70,0,0,850,851,5,140,
        0,0,851,858,3,196,98,0,852,854,5,140,0,0,853,852,1,0,0,0,853,854,
        1,0,0,0,854,855,1,0,0,0,855,856,5,71,0,0,856,857,5,140,0,0,857,859,
        3,68,34,0,858,853,1,0,0,0,858,859,1,0,0,0,859,65,1,0,0,0,860,861,
        5,70,0,0,861,864,5,140,0,0,862,865,3,196,98,0,863,865,3,198,99,0,
        864,862,1,0,0,0,864,863,1,0,0,0,865,875,1,0,0,0,866,868,5,140,0,
        0,867,866,1,0,0,0,867,868,1,0,0,0,868,869,1,0,0,0,869,870,5,71,0,
        0,870,873,5,140,0,0,871,874,5,11,0,0,872,874,3,68,34,0,873,871,1,
        0,0,0,873,872,1,0,0,0,874,876,1,0,0,0,875,867,1,0,0,0,875,876,1,
        0,0,0,876,67,1,0,0,0,877,888,3,70,35,0,878,880,5,140,0,0,879,878,
        1,0,0,0,879,880,1,0,0,0,880,881,1,0,0,0,881,883,5,4,0,0,882,884,
        5,140,0,0,883,882,1,0,0,0,883,884,1,0,0,0,884,885,1,0,0,0,885,887,
        3,70,35,0,886,879,1,0,0,0,887,890,1,0,0,0,888,886,1,0,0,0,888,889,
        1,0,0,0,889,895,1,0,0,0,890,888,1,0,0,0,891,893,5,140,0,0,892,891,
        1,0,0,0,892,893,1,0,0,0,893,894,1,0,0,0,894,896,3,94,47,0,895,892,
        1,0,0,0,895,896,1,0,0,0,896,69,1,0,0,0,897,898,3,200,100,0,898,899,
        5,140,0,0,899,900,5,62,0,0,900,901,5,140,0,0,901,903,1,0,0,0,902,
        897,1,0,0,0,902,903,1,0,0,0,903,904,1,0,0,0,904,905,3,206,103,0,
        905,71,1,0,0,0,906,907,5,72,0,0,907,912,3,76,38,0,908,910,5,140,
        0,0,909,908,1,0,0,0,909,910,1,0,0,0,910,911,1,0,0,0,911,913,3,94,
        47,0,912,909,1,0,0,0,912,913,1,0,0,0,913,73,1,0,0,0,914,915,5,73,
        0,0,915,916,3,76,38,0,916,75,1,0,0,0,917,919,5,140,0,0,918,917,1,
        0,0,0,918,919,1,0,0,0,919,920,1,0,0,0,920,922,5,74,0,0,921,918,1,
        0,0,0,921,922,1,0,0,0,922,923,1,0,0,0,923,924,5,140,0,0,924,927,
        3,78,39,0,925,926,5,140,0,0,926,928,3,86,43,0,927,925,1,0,0,0,927,
        928,1,0,0,0,928,931,1,0,0,0,929,930,5,140,0,0,930,932,3,88,44,0,
        931,929,1,0,0,0,931,932,1,0,0,0,932,935,1,0,0,0,933,934,5,140,0,
        0,934,936,3,90,45,0,935,933,1,0,0,0,935,936,1,0,0,0,936,77,1,0,0,
        0,937,948,5,11,0,0,938,940,5,140,0,0,939,938,1,0,0,0,939,940,1,0,
        0,0,940,941,1,0,0,0,941,943,5,4,0,0,942,944,5,140,0,0,943,942,1,
        0,0,0,943,944,1,0,0,0,944,945,1,0,0,0,945,947,3,80,40,0,946,939,
        1,0,0,0,947,950,1,0,0,0,948,946,1,0,0,0,948,949,1,0,0,0,949,966,
        1,0,0,0,950,948,1,0,0,0,951,962,3,80,40,0,952,954,5,140,0,0,953,
        952,1,0,0,0,953,954,1,0,0,0,954,955,1,0,0,0,955,957,5,4,0,0,956,
        958,5,140,0,0,957,956,1,0,0,0,957,958,1,0,0,0,958,959,1,0,0,0,959,
        961,3,80,40,0,960,953,1,0,0,0,961,964,1,0,0,0,962,960,1,0,0,0,962,
        963,1,0,0,0,963,966,1,0,0,0,964,962,1,0,0,0,965,937,1,0,0,0,965,
        951,1,0,0,0,966,79,1,0,0,0,967,968,3,132,66,0,968,969,5,140,0,0,
        969,970,5,62,0,0,970,971,5,140,0,0,971,972,3,206,103,0,972,981,1,
        0,0,0,973,978,3,132,66,0,974,976,5,140,0,0,975,974,1,0,0,0,975,976,
        1,0,0,0,976,977,1,0,0,0,977,979,3,82,41,0,978,975,1,0,0,0,978,979,
        1,0,0,0,979,981,1,0,0,0,980,967,1,0,0,0,980,973,1,0,0,0,981,81,1,
        0,0,0,982,984,5,7,0,0,983,985,5,140,0,0,984,983,1,0,0,0,984,985,
        1,0,0,0,985,1000,1,0,0,0,986,997,3,84,42,0,987,989,5,140,0,0,988,
        987,1,0,0,0,988,989,1,0,0,0,989,990,1,0,0,0,990,992,5,4,0,0,991,
        993,5,140,0,0,992,991,1,0,0,0,992,993,1,0,0,0,993,994,1,0,0,0,994,
        996,3,84,42,0,995,988,1,0,0,0,996,999,1,0,0,0,997,995,1,0,0,0,997,
        998,1,0,0,0,998,1001,1,0,0,0,999,997,1,0,0,0,1000,986,1,0,0,0,1000,
        1001,1,0,0,0,1001,1003,1,0,0,0,1002,1004,5,140,0,0,1003,1002,1,0,
        0,0,1003,1004,1,0,0,0,1004,1005,1,0,0,0,1005,1006,5,8,0,0,1006,83,
        1,0,0,0,1007,1009,5,12,0,0,1008,1010,5,140,0,0,1009,1008,1,0,0,0,
        1009,1010,1,0,0,0,1010,1011,1,0,0,0,1011,1029,5,11,0,0,1012,1014,
        5,12,0,0,1013,1015,5,140,0,0,1014,1013,1,0,0,0,1014,1015,1,0,0,0,
        1015,1016,1,0,0,0,1016,1029,3,222,111,0,1017,1019,3,222,111,0,1018,
        1020,5,140,0,0,1019,1018,1,0,0,0,1019,1020,1,0,0,0,1020,1021,1,0,
        0,0,1021,1023,5,2,0,0,1022,1024,5,140,0,0,1023,1022,1,0,0,0,1023,
        1024,1,0,0,0,1024,1025,1,0,0,0,1025,1026,3,132,66,0,1026,1029,1,
        0,0,0,1027,1029,3,206,103,0,1028,1007,1,0,0,0,1028,1012,1,0,0,0,
        1028,1017,1,0,0,0,1028,1027,1,0,0,0,1029,85,1,0,0,0,1030,1031,5,
        75,0,0,1031,1032,5,140,0,0,1032,1033,5,76,0,0,1033,1034,5,140,0,
        0,1034,1042,3,92,46,0,1035,1037,5,4,0,0,1036,1038,5,140,0,0,1037,
        1036,1,0,0,0,1037,1038,1,0,0,0,1038,1039,1,0,0,0,1039,1041,3,92,
        46,0,1040,1035,1,0,0,0,1041,1044,1,0,0,0,1042,1040,1,0,0,0,1042,
        1043,1,0,0,0,1043,87,1,0,0,0,1044,1042,1,0,0,0,1045,1046,5,77,0,
        0,1046,1047,5,140,0,0,1047,1048,3,132,66,0,1048,89,1,0,0,0,1049,
        1050,5,78,0,0,1050,1051,5,140,0,0,1051,1052,3,132,66,0,1052,91,1,
        0,0,0,1053,1058,3,132,66,0,1054,1056,5,140,0,0,1055,1054,1,0,0,0,
        1055,1056,1,0,0,0,1056,1057,1,0,0,0,1057,1059,7,1,0,0,1058,1055,
        1,0,0,0,1058,1059,1,0,0,0,1059,93,1,0,0,0,1060,1061,5,83,0,0,1061,
        1062,5,140,0,0,1062,1063,3,132,66,0,1063,95,1,0,0,0,1064,1075,3,
        98,49,0,1065,1067,5,140,0,0,1066,1065,1,0,0,0,1066,1067,1,0,0,0,
        1067,1068,1,0,0,0,1068,1070,5,4,0,0,1069,1071,5,140,0,0,1070,1069,
        1,0,0,0,1070,1071,1,0,0,0,1071,1072,1,0,0,0,1072,1074,3,98,49,0,
        1073,1066,1,0,0,0,1074,1077,1,0,0,0,1075,1073,1,0,0,0,1075,1076,
        1,0,0,0,1076,97,1,0,0,0,1077,1075,1,0,0,0,1078,1080,3,206,103,0,
        1079,1081,5,140,0,0,1080,1079,1,0,0,0,1080,1081,1,0,0,0,1081,1082,
        1,0,0,0,1082,1084,5,9,0,0,1083,1085,5,140,0,0,1084,1083,1,0,0,0,
        1084,1085,1,0,0,0,1085,1086,1,0,0,0,1086,1087,3,100,50,0,1087,1090,
        1,0,0,0,1088,1090,3,100,50,0,1089,1078,1,0,0,0,1089,1088,1,0,0,0,
        1090,99,1,0,0,0,1091,1094,3,102,51,0,1092,1094,3,104,52,0,1093,1091,
        1,0,0,0,1093,1092,1,0,0,0,1094,101,1,0,0,0,1095,1097,7,2,0,0,1096,
        1098,5,140,0,0,1097,1096,1,0,0,0,1097,1098,1,0,0,0,1098,1099,1,0,
        0,0,1099,1101,5,3,0,0,1100,1102,5,140,0,0,1101,1100,1,0,0,0,1101,
        1102,1,0,0,0,1102,1103,1,0,0,0,1103,1105,3,104,52,0,1104,1106,5,
        140,0,0,1105,1104,1,0,0,0,1105,1106,1,0,0,0,1106,1107,1,0,0,0,1107,
        1108,5,5,0,0,1108,103,1,0,0,0,1109,1116,3,108,54,0,1110,1112,5,140,
        0,0,1111,1110,1,0,0,0,1111,1112,1,0,0,0,1112,1113,1,0,0,0,1113,1115,
        3,110,55,0,1114,1111,1,0,0,0,1115,1118,1,0,0,0,1116,1114,1,0,0,0,
        1116,1117,1,0,0,0,1117,1124,1,0,0,0,1118,1116,1,0,0,0,1119,1120,
        5,3,0,0,1120,1121,3,104,52,0,1121,1122,5,5,0,0,1122,1124,1,0,0,0,
        1123,1109,1,0,0,0,1123,1119,1,0,0,0,1124,105,1,0,0,0,1125,1130,3,
        108,54,0,1126,1128,5,140,0,0,1127,1126,1,0,0,0,1127,1128,1,0,0,0,
        1128,1129,1,0,0,0,1129,1131,3,110,55,0,1130,1127,1,0,0,0,1131,1132,
        1,0,0,0,1132,1130,1,0,0,0,1132,1133,1,0,0,0,1133,107,1,0,0,0,1134,
        1136,5,3,0,0,1135,1137,5,140,0,0,1136,1135,1,0,0,0,1136,1137,1,0,
        0,0,1137,1142,1,0,0,0,1138,1140,3,206,103,0,1139,1141,5,140,0,0,
        1140,1139,1,0,0,0,1140,1141,1,0,0,0,1141,1143,1,0,0,0,1142,1138,
        1,0,0,0,1142,1143,1,0,0,0,1143,1148,1,0,0,0,1144,1146,3,120,60,0,
        1145,1147,5,140,0,0,1146,1145,1,0,0,0,1146,1147,1,0,0,0,1147,1149,
        1,0,0,0,1148,1144,1,0,0,0,1148,1149,1,0,0,0,1149,1154,1,0,0,0,1150,
        1152,3,116,58,0,1151,1153,5,140,0,0,1152,1151,1,0,0,0,1152,1153,
        1,0,0,0,1153,1155,1,0,0,0,1154,1150,1,0,0,0,1154,1155,1,0,0,0,1155,
        1156,1,0,0,0,1156,1157,5,5,0,0,1157,109,1,0,0,0,1158,1160,3,112,
        56,0,1159,1161,5,140,0,0,1160,1159,1,0,0,0,1160,1161,1,0,0,0,1161,
        1162,1,0,0,0,1162,1163,3,108,54,0,1163,111,1,0,0,0,1164,1166,3,234,
        117,0,1165,1167,5,140,0,0,1166,1165,1,0,0,0,1166,1167,1,0,0,0,1167,
        1168,1,0,0,0,1168,1170,3,238,119,0,1169,1171,5,140,0,0,1170,1169,
        1,0,0,0,1170,1171,1,0,0,0,1171,1173,1,0,0,0,1172,1174,3,114,57,0,
        1173,1172,1,0,0,0,1173,1174,1,0,0,0,1174,1176,1,0,0,0,1175,1177,
        5,140,0,0,1176,1175,1,0,0,0,1176,1177,1,0,0,0,1177,1178,1,0,0,0,
        1178,1180,3,238,119,0,1179,1181,5,140,0,0,1180,1179,1,0,0,0,1180,
        1181,1,0,0,0,1181,1182,1,0,0,0,1182,1183,3,236,118,0,1183,1229,1,
        0,0,0,1184,1186,3,234,117,0,1185,1187,5,140,0,0,1186,1185,1,0,0,
        0,1186,1187,1,0,0,0,1187,1188,1,0,0,0,1188,1190,3,238,119,0,1189,
        1191,5,140,0,0,1190,1189,1,0,0,0,1190,1191,1,0,0,0,1191,1193,1,0,
        0,0,1192,1194,3,114,57,0,1193,1192,1,0,0,0,1193,1194,1,0,0,0,1194,
        1196,1,0,0,0,1195,1197,5,140,0,0,1196,1195,1,0,0,0,1196,1197,1,0,
        0,0,1197,1198,1,0,0,0,1198,1199,3,238,119,0,1199,1229,1,0,0,0,1200,
        1202,3,238,119,0,1201,1203,5,140,0,0,1202,1201,1,0,0,0,1202,1203,
        1,0,0,0,1203,1205,1,0,0,0,1204,1206,3,114,57,0,1205,1204,1,0,0,0,
        1205,1206,1,0,0,0,1206,1208,1,0,0,0,1207,1209,5,140,0,0,1208,1207,
        1,0,0,0,1208,1209,1,0,0,0,1209,1210,1,0,0,0,1210,1212,3,238,119,
        0,1211,1213,5,140,0,0,1212,1211,1,0,0,0,1212,1213,1,0,0,0,1213,1214,
        1,0,0,0,1214,1215,3,236,118,0,1215,1229,1,0,0,0,1216,1218,3,238,
        119,0,1217,1219,5,140,0,0,1218,1217,1,0,0,0,1218,1219,1,0,0,0,1219,
        1221,1,0,0,0,1220,1222,3,114,57,0,1221,1220,1,0,0,0,1221,1222,1,
        0,0,0,1222,1224,1,0,0,0,1223,1225,5,140,0,0,1224,1223,1,0,0,0,1224,
        1225,1,0,0,0,1225,1226,1,0,0,0,1226,1227,3,238,119,0,1227,1229,1,
        0,0,0,1228,1164,1,0,0,0,1228,1184,1,0,0,0,1228,1200,1,0,0,0,1228,
        1216,1,0,0,0,1229,113,1,0,0,0,1230,1232,5,13,0,0,1231,1233,5,140,
        0,0,1232,1231,1,0,0,0,1232,1233,1,0,0,0,1233,1238,1,0,0,0,1234,1236,
        3,206,103,0,1235,1237,5,140,0,0,1236,1235,1,0,0,0,1236,1237,1,0,
        0,0,1237,1239,1,0,0,0,1238,1234,1,0,0,0,1238,1239,1,0,0,0,1239,1244,
        1,0,0,0,1240,1242,3,118,59,0,1241,1243,5,140,0,0,1242,1241,1,0,0,
        0,1242,1243,1,0,0,0,1243,1245,1,0,0,0,1244,1240,1,0,0,0,1244,1245,
        1,0,0,0,1245,1247,1,0,0,0,1246,1248,3,124,62,0,1247,1246,1,0,0,0,
        1247,1248,1,0,0,0,1248,1253,1,0,0,0,1249,1251,3,116,58,0,1250,1252,
        5,140,0,0,1251,1250,1,0,0,0,1251,1252,1,0,0,0,1252,1254,1,0,0,0,
        1253,1249,1,0,0,0,1253,1254,1,0,0,0,1254,1255,1,0,0,0,1255,1256,
        5,14,0,0,1256,115,1,0,0,0,1257,1260,3,220,110,0,1258,1260,3,224,
        112,0,1259,1257,1,0,0,0,1259,1258,1,0,0,0,1260,117,1,0,0,0,1261,
        1263,5,2,0,0,1262,1264,5,140,0,0,1263,1262,1,0,0,0,1263,1264,1,0,
        0,0,1264,1265,1,0,0,0,1265,1279,3,128,64,0,1266,1268,5,140,0,0,1267,
        1266,1,0,0,0,1267,1268,1,0,0,0,1268,1269,1,0,0,0,1269,1271,5,6,0,
        0,1270,1272,5,2,0,0,1271,1270,1,0,0,0,1271,1272,1,0,0,0,1272,1274,
        1,0,0,0,1273,1275,5,140,0,0,1274,1273,1,0,0,0,1274,1275,1,0,0,0,
        1275,1276,1,0,0,0,1276,1278,3,128,64,0,1277,1267,1,0,0,0,1278,1281,
        1,0,0,0,1279,1277,1,0,0,0,1279,1280,1,0,0,0,1280,119,1,0,0,0,1281,
        1279,1,0,0,0,1282,1289,3,122,61,0,1283,1285,5,140,0,0,1284,1283,
        1,0,0,0,1284,1285,1,0,0,0,1285,1286,1,0,0,0,1286,1288,3,122,61,0,
        1287,1284,1,0,0,0,1288,1291,1,0,0,0,1289,1287,1,0,0,0,1289,1290,
        1,0,0,0,1290,121,1,0,0,0,1291,1289,1,0,0,0,1292,1294,5,2,0,0,1293,
        1295,5,140,0,0,1294,1293,1,0,0,0,1294,1295,1,0,0,0,1295,1296,1,0,
        0,0,1296,1297,3,126,63,0,1297,123,1,0,0,0,1298,1300,5,11,0,0,1299,
        1301,5,140,0,0,1300,1299,1,0,0,0,1300,1301,1,0,0,0,1301,1306,1,0,
        0,0,1302,1304,3,214,107,0,1303,1305,5,140,0,0,1304,1303,1,0,0,0,
        1304,1305,1,0,0,0,1305,1307,1,0,0,0,1306,1302,1,0,0,0,1306,1307,
        1,0,0,0,1307,1318,1,0,0,0,1308,1310,5,15,0,0,1309,1311,5,140,0,0,
        1310,1309,1,0,0,0,1310,1311,1,0,0,0,1311,1316,1,0,0,0,1312,1314,
        3,214,107,0,1313,1315,5,140,0,0,1314,1313,1,0,0,0,1314,1315,1,0,
        0,0,1315,1317,1,0,0,0,1316,1312,1,0,0,0,1316,1317,1,0,0,0,1317,1319,
        1,0,0,0,1318,1308,1,0,0,0,1318,1319,1,0,0,0,1319,125,1,0,0,0,1320,
        1321,3,226,113,0,1321,127,1,0,0,0,1322,1323,3,226,113,0,1323,129,
        1,0,0,0,1324,1329,3,168,84,0,1325,1327,5,140,0,0,1326,1325,1,0,0,
        0,1326,1327,1,0,0,0,1327,1328,1,0,0,0,1328,1330,3,166,83,0,1329,
        1326,1,0,0,0,1330,1331,1,0,0,0,1331,1329,1,0,0,0,1331,1332,1,0,0,
        0,1332,131,1,0,0,0,1333,1334,3,134,67,0,1334,133,1,0,0,0,1335,1342,
        3,136,68,0,1336,1337,5,140,0,0,1337,1338,5,86,0,0,1338,1339,5,140,
        0,0,1339,1341,3,136,68,0,1340,1336,1,0,0,0,1341,1344,1,0,0,0,1342,
        1340,1,0,0,0,1342,1343,1,0,0,0,1343,135,1,0,0,0,1344,1342,1,0,0,
        0,1345,1352,3,138,69,0,1346,1347,5,140,0,0,1347,1348,5,87,0,0,1348,
        1349,5,140,0,0,1349,1351,3,138,69,0,1350,1346,1,0,0,0,1351,1354,
        1,0,0,0,1352,1350,1,0,0,0,1352,1353,1,0,0,0,1353,137,1,0,0,0,1354,
        1352,1,0,0,0,1355,1362,3,140,70,0,1356,1357,5,140,0,0,1357,1358,
        5,88,0,0,1358,1359,5,140,0,0,1359,1361,3,140,70,0,1360,1356,1,0,
        0,0,1361,1364,1,0,0,0,1362,1360,1,0,0,0,1362,1363,1,0,0,0,1363,139,
        1,0,0,0,1364,1362,1,0,0,0,1365,1367,5,89,0,0,1366,1368,5,140,0,0,
        1367,1366,1,0,0,0,1367,1368,1,0,0,0,1368,1370,1,0,0,0,1369,1365,
        1,0,0,0,1370,1373,1,0,0,0,1371,1369,1,0,0,0,1371,1372,1,0,0,0,1372,
        1374,1,0,0,0,1373,1371,1,0,0,0,1374,1375,3,142,71,0,1375,141,1,0,
        0,0,1376,1383,3,146,73,0,1377,1379,5,140,0,0,1378,1377,1,0,0,0,1378,
        1379,1,0,0,0,1379,1380,1,0,0,0,1380,1382,3,144,72,0,1381,1378,1,
        0,0,0,1382,1385,1,0,0,0,1383,1381,1,0,0,0,1383,1384,1,0,0,0,1384,
        143,1,0,0,0,1385,1383,1,0,0,0,1386,1388,5,9,0,0,1387,1389,5,140,
        0,0,1388,1387,1,0,0,0,1388,1389,1,0,0,0,1389,1390,1,0,0,0,1390,1417,
        3,146,73,0,1391,1393,5,16,0,0,1392,1394,5,140,0,0,1393,1392,1,0,
        0,0,1393,1394,1,0,0,0,1394,1395,1,0,0,0,1395,1417,3,146,73,0,1396,
        1398,5,17,0,0,1397,1399,5,140,0,0,1398,1397,1,0,0,0,1398,1399,1,
        0,0,0,1399,1400,1,0,0,0,1400,1417,3,146,73,0,1401,1403,5,18,0,0,
        1402,1404,5,140,0,0,1403,1402,1,0,0,0,1403,1404,1,0,0,0,1404,1405,
        1,0,0,0,1405,1417,3,146,73,0,1406,1408,5,19,0,0,1407,1409,5,140,
        0,0,1408,1407,1,0,0,0,1408,1409,1,0,0,0,1409,1410,1,0,0,0,1410,1417,
        3,146,73,0,1411,1413,5,20,0,0,1412,1414,5,140,0,0,1413,1412,1,0,
        0,0,1413,1414,1,0,0,0,1414,1415,1,0,0,0,1415,1417,3,146,73,0,1416,
        1386,1,0,0,0,1416,1391,1,0,0,0,1416,1396,1,0,0,0,1416,1401,1,0,0,
        0,1416,1406,1,0,0,0,1416,1411,1,0,0,0,1417,145,1,0,0,0,1418,1424,
        3,154,77,0,1419,1423,3,148,74,0,1420,1423,3,150,75,0,1421,1423,3,
        152,76,0,1422,1419,1,0,0,0,1422,1420,1,0,0,0,1422,1421,1,0,0,0,1423,
        1426,1,0,0,0,1424,1422,1,0,0,0,1424,1425,1,0,0,0,1425,147,1,0,0,
        0,1426,1424,1,0,0,0,1427,1428,5,140,0,0,1428,1429,5,90,0,0,1429,
        1430,5,140,0,0,1430,1438,5,72,0,0,1431,1432,5,140,0,0,1432,1433,
        5,91,0,0,1433,1434,5,140,0,0,1434,1438,5,72,0,0,1435,1436,5,140,
        0,0,1436,1438,5,92,0,0,1437,1427,1,0,0,0,1437,1431,1,0,0,0,1437,
        1435,1,0,0,0,1438,1440,1,0,0,0,1439,1441,5,140,0,0,1440,1439,1,0,
        0,0,1440,1441,1,0,0,0,1441,1442,1,0,0,0,1442,1443,3,154,77,0,1443,
        149,1,0,0,0,1444,1445,5,140,0,0,1445,1447,5,93,0,0,1446,1448,5,140,
        0,0,1447,1446,1,0,0,0,1447,1448,1,0,0,0,1448,1449,1,0,0,0,1449,1450,
        3,154,77,0,1450,151,1,0,0,0,1451,1452,5,140,0,0,1452,1453,5,94,0,
        0,1453,1454,5,140,0,0,1454,1462,5,95,0,0,1455,1456,5,140,0,0,1456,
        1457,5,94,0,0,1457,1458,5,140,0,0,1458,1459,5,89,0,0,1459,1460,5,
        140,0,0,1460,1462,5,95,0,0,1461,1451,1,0,0,0,1461,1455,1,0,0,0,1462,
        153,1,0,0,0,1463,1482,3,156,78,0,1464,1466,5,140,0,0,1465,1464,1,
        0,0,0,1465,1466,1,0,0,0,1466,1467,1,0,0,0,1467,1469,5,21,0,0,1468,
        1470,5,140,0,0,1469,1468,1,0,0,0,1469,1470,1,0,0,0,1470,1471,1,0,
        0,0,1471,1481,3,156,78,0,1472,1474,5,140,0,0,1473,1472,1,0,0,0,1473,
        1474,1,0,0,0,1474,1475,1,0,0,0,1475,1477,5,22,0,0,1476,1478,5,140,
        0,0,1477,1476,1,0,0,0,1477,1478,1,0,0,0,1478,1479,1,0,0,0,1479,1481,
        3,156,78,0,1480,1465,1,0,0,0,1480,1473,1,0,0,0,1481,1484,1,0,0,0,
        1482,1480,1,0,0,0,1482,1483,1,0,0,0,1483,155,1,0,0,0,1484,1482,1,
        0,0,0,1485,1512,3,158,79,0,1486,1488,5,140,0,0,1487,1486,1,0,0,0,
        1487,1488,1,0,0,0,1488,1489,1,0,0,0,1489,1491,5,11,0,0,1490,1492,
        5,140,0,0,1491,1490,1,0,0,0,1491,1492,1,0,0,0,1492,1493,1,0,0,0,
        1493,1511,3,158,79,0,1494,1496,5,140,0,0,1495,1494,1,0,0,0,1495,
        1496,1,0,0,0,1496,1497,1,0,0,0,1497,1499,5,23,0,0,1498,1500,5,140,
        0,0,1499,1498,1,0,0,0,1499,1500,1,0,0,0,1500,1501,1,0,0,0,1501,1511,
        3,158,79,0,1502,1504,5,140,0,0,1503,1502,1,0,0,0,1503,1504,1,0,0,
        0,1504,1505,1,0,0,0,1505,1507,5,24,0,0,1506,1508,5,140,0,0,1507,
        1506,1,0,0,0,1507,1508,1,0,0,0,1508,1509,1,0,0,0,1509,1511,3,158,
        79,0,1510,1487,1,0,0,0,1510,1495,1,0,0,0,1510,1503,1,0,0,0,1511,
        1514,1,0,0,0,1512,1510,1,0,0,0,1512,1513,1,0,0,0,1513,157,1,0,0,
        0,1514,1512,1,0,0,0,1515,1526,3,160,80,0,1516,1518,5,140,0,0,1517,
        1516,1,0,0,0,1517,1518,1,0,0,0,1518,1519,1,0,0,0,1519,1521,5,25,
        0,0,1520,1522,5,140,0,0,1521,1520,1,0,0,0,1521,1522,1,0,0,0,1522,
        1523,1,0,0,0,1523,1525,3,160,80,0,1524,1517,1,0,0,0,1525,1528,1,
        0,0,0,1526,1524,1,0,0,0,1526,1527,1,0,0,0,1527,159,1,0,0,0,1528,
        1526,1,0,0,0,1529,1536,3,162,81,0,1530,1532,7,3,0,0,1531,1533,5,
        140,0,0,1532,1531,1,0,0,0,1532,1533,1,0,0,0,1533,1534,1,0,0,0,1534,
        1536,3,162,81,0,1535,1529,1,0,0,0,1535,1530,1,0,0,0,1536,161,1,0,
        0,0,1537,1548,3,168,84,0,1538,1540,5,140,0,0,1539,1538,1,0,0,0,1539,
        1540,1,0,0,0,1540,1541,1,0,0,0,1541,1547,3,164,82,0,1542,1544,5,
        140,0,0,1543,1542,1,0,0,0,1543,1544,1,0,0,0,1544,1545,1,0,0,0,1545,
        1547,3,166,83,0,1546,1539,1,0,0,0,1546,1543,1,0,0,0,1547,1550,1,
        0,0,0,1548,1546,1,0,0,0,1548,1549,1,0,0,0,1549,1555,1,0,0,0,1550,
        1548,1,0,0,0,1551,1553,5,140,0,0,1552,1551,1,0,0,0,1552,1553,1,0,
        0,0,1553,1554,1,0,0,0,1554,1556,3,120,60,0,1555,1552,1,0,0,0,1555,
        1556,1,0,0,0,1556,163,1,0,0,0,1557,1558,5,13,0,0,1558,1559,3,132,
        66,0,1559,1560,5,14,0,0,1560,1571,1,0,0,0,1561,1563,5,13,0,0,1562,
        1564,3,132,66,0,1563,1562,1,0,0,0,1563,1564,1,0,0,0,1564,1565,1,
        0,0,0,1565,1567,5,15,0,0,1566,1568,3,132,66,0,1567,1566,1,0,0,0,
        1567,1568,1,0,0,0,1568,1569,1,0,0,0,1569,1571,5,14,0,0,1570,1557,
        1,0,0,0,1570,1561,1,0,0,0,1571,165,1,0,0,0,1572,1574,5,12,0,0,1573,
        1575,5,140,0,0,1574,1573,1,0,0,0,1574,1575,1,0,0,0,1575,1576,1,0,
        0,0,1576,1577,3,222,111,0,1577,167,1,0,0,0,1578,1605,3,208,104,0,
        1579,1605,3,224,112,0,1580,1605,3,170,85,0,1581,1583,5,96,0,0,1582,
        1584,5,140,0,0,1583,1582,1,0,0,0,1583,1584,1,0,0,0,1584,1585,1,0,
        0,0,1585,1587,5,3,0,0,1586,1588,5,140,0,0,1587,1586,1,0,0,0,1587,
        1588,1,0,0,0,1588,1589,1,0,0,0,1589,1591,5,11,0,0,1590,1592,5,140,
        0,0,1591,1590,1,0,0,0,1591,1592,1,0,0,0,1592,1593,1,0,0,0,1593,1605,
        5,5,0,0,1594,1605,3,174,87,0,1595,1605,3,176,88,0,1596,1605,3,188,
        94,0,1597,1605,3,102,51,0,1598,1605,3,178,89,0,1599,1605,3,182,91,
        0,1600,1605,3,184,92,0,1601,1605,3,190,95,0,1602,1605,3,194,97,0,
        1603,1605,3,206,103,0,1604,1578,1,0,0,0,1604,1579,1,0,0,0,1604,1580,
        1,0,0,0,1604,1581,1,0,0,0,1604,1594,1,0,0,0,1604,1595,1,0,0,0,1604,
        1596,1,0,0,0,1604,1597,1,0,0,0,1604,1598,1,0,0,0,1604,1599,1,0,0,
        0,1604,1600,1,0,0,0,1604,1601,1,0,0,0,1604,1602,1,0,0,0,1604,1603,
        1,0,0,0,1605,169,1,0,0,0,1606,1611,5,97,0,0,1607,1609,5,140,0,0,
        1608,1607,1,0,0,0,1608,1609,1,0,0,0,1609,1610,1,0,0,0,1610,1612,
        3,172,86,0,1611,1608,1,0,0,0,1612,1613,1,0,0,0,1613,1611,1,0,0,0,
        1613,1614,1,0,0,0,1614,1629,1,0,0,0,1615,1617,5,97,0,0,1616,1618,
        5,140,0,0,1617,1616,1,0,0,0,1617,1618,1,0,0,0,1618,1619,1,0,0,0,
        1619,1624,3,132,66,0,1620,1622,5,140,0,0,1621,1620,1,0,0,0,1621,
        1622,1,0,0,0,1622,1623,1,0,0,0,1623,1625,3,172,86,0,1624,1621,1,
        0,0,0,1625,1626,1,0,0,0,1626,1624,1,0,0,0,1626,1627,1,0,0,0,1627,
        1629,1,0,0,0,1628,1606,1,0,0,0,1628,1615,1,0,0,0,1629,1638,1,0,0,
        0,1630,1632,5,140,0,0,1631,1630,1,0,0,0,1631,1632,1,0,0,0,1632,1633,
        1,0,0,0,1633,1635,5,98,0,0,1634,1636,5,140,0,0,1635,1634,1,0,0,0,
        1635,1636,1,0,0,0,1636,1637,1,0,0,0,1637,1639,3,132,66,0,1638,1631,
        1,0,0,0,1638,1639,1,0,0,0,1639,1641,1,0,0,0,1640,1642,5,140,0,0,
        1641,1640,1,0,0,0,1641,1642,1,0,0,0,1642,1643,1,0,0,0,1643,1644,
        5,99,0,0,1644,171,1,0,0,0,1645,1647,5,100,0,0,1646,1648,5,140,0,
        0,1647,1646,1,0,0,0,1647,1648,1,0,0,0,1648,1649,1,0,0,0,1649,1651,
        3,132,66,0,1650,1652,5,140,0,0,1651,1650,1,0,0,0,1651,1652,1,0,0,
        0,1652,1653,1,0,0,0,1653,1655,5,101,0,0,1654,1656,5,140,0,0,1655,
        1654,1,0,0,0,1655,1656,1,0,0,0,1656,1657,1,0,0,0,1657,1658,3,132,
        66,0,1658,173,1,0,0,0,1659,1661,5,13,0,0,1660,1662,5,140,0,0,1661,
        1660,1,0,0,0,1661,1662,1,0,0,0,1662,1663,1,0,0,0,1663,1672,3,180,
        90,0,1664,1666,5,140,0,0,1665,1664,1,0,0,0,1665,1666,1,0,0,0,1666,
        1667,1,0,0,0,1667,1669,5,6,0,0,1668,1670,5,140,0,0,1669,1668,1,0,
        0,0,1669,1670,1,0,0,0,1670,1671,1,0,0,0,1671,1673,3,132,66,0,1672,
        1665,1,0,0,0,1672,1673,1,0,0,0,1673,1675,1,0,0,0,1674,1676,5,140,
        0,0,1675,1674,1,0,0,0,1675,1676,1,0,0,0,1676,1677,1,0,0,0,1677,1678,
        5,14,0,0,1678,175,1,0,0,0,1679,1681,5,13,0,0,1680,1682,5,140,0,0,
        1681,1680,1,0,0,0,1681,1682,1,0,0,0,1682,1691,1,0,0,0,1683,1685,
        3,206,103,0,1684,1686,5,140,0,0,1685,1684,1,0,0,0,1685,1686,1,0,
        0,0,1686,1687,1,0,0,0,1687,1689,5,9,0,0,1688,1690,5,140,0,0,1689,
        1688,1,0,0,0,1689,1690,1,0,0,0,1690,1692,1,0,0,0,1691,1683,1,0,0,
        0,1691,1692,1,0,0,0,1692,1693,1,0,0,0,1693,1695,3,106,53,0,1694,
        1696,5,140,0,0,1695,1694,1,0,0,0,1695,1696,1,0,0,0,1696,1701,1,0,
        0,0,1697,1699,3,94,47,0,1698,1700,5,140,0,0,1699,1698,1,0,0,0,1699,
        1700,1,0,0,0,1700,1702,1,0,0,0,1701,1697,1,0,0,0,1701,1702,1,0,0,
        0,1702,1703,1,0,0,0,1703,1705,5,6,0,0,1704,1706,5,140,0,0,1705,1704,
        1,0,0,0,1705,1706,1,0,0,0,1706,1707,1,0,0,0,1707,1709,3,132,66,0,
        1708,1710,5,140,0,0,1709,1708,1,0,0,0,1709,1710,1,0,0,0,1710,1711,
        1,0,0,0,1711,1712,5,14,0,0,1712,177,1,0,0,0,1713,1715,5,52,0,0,1714,
        1716,5,140,0,0,1715,1714,1,0,0,0,1715,1716,1,0,0,0,1716,1717,1,0,
        0,0,1717,1719,5,3,0,0,1718,1720,5,140,0,0,1719,1718,1,0,0,0,1719,
        1720,1,0,0,0,1720,1721,1,0,0,0,1721,1723,3,180,90,0,1722,1724,5,
        140,0,0,1723,1722,1,0,0,0,1723,1724,1,0,0,0,1724,1725,1,0,0,0,1725,
        1726,5,5,0,0,1726,1770,1,0,0,0,1727,1729,5,102,0,0,1728,1730,5,140,
        0,0,1729,1728,1,0,0,0,1729,1730,1,0,0,0,1730,1731,1,0,0,0,1731,1733,
        5,3,0,0,1732,1734,5,140,0,0,1733,1732,1,0,0,0,1733,1734,1,0,0,0,
        1734,1735,1,0,0,0,1735,1737,3,180,90,0,1736,1738,5,140,0,0,1737,
        1736,1,0,0,0,1737,1738,1,0,0,0,1738,1739,1,0,0,0,1739,1740,5,5,0,
        0,1740,1770,1,0,0,0,1741,1743,5,103,0,0,1742,1744,5,140,0,0,1743,
        1742,1,0,0,0,1743,1744,1,0,0,0,1744,1745,1,0,0,0,1745,1747,5,3,0,
        0,1746,1748,5,140,0,0,1747,1746,1,0,0,0,1747,1748,1,0,0,0,1748,1749,
        1,0,0,0,1749,1751,3,180,90,0,1750,1752,5,140,0,0,1751,1750,1,0,0,
        0,1751,1752,1,0,0,0,1752,1753,1,0,0,0,1753,1754,5,5,0,0,1754,1770,
        1,0,0,0,1755,1757,5,104,0,0,1756,1758,5,140,0,0,1757,1756,1,0,0,
        0,1757,1758,1,0,0,0,1758,1759,1,0,0,0,1759,1761,5,3,0,0,1760,1762,
        5,140,0,0,1761,1760,1,0,0,0,1761,1762,1,0,0,0,1762,1763,1,0,0,0,
        1763,1765,3,180,90,0,1764,1766,5,140,0,0,1765,1764,1,0,0,0,1765,
        1766,1,0,0,0,1766,1767,1,0,0,0,1767,1768,5,5,0,0,1768,1770,1,0,0,
        0,1769,1713,1,0,0,0,1769,1727,1,0,0,0,1769,1741,1,0,0,0,1769,1755,
        1,0,0,0,1770,179,1,0,0,0,1771,1776,3,186,93,0,1772,1774,5,140,0,
        0,1773,1772,1,0,0,0,1773,1774,1,0,0,0,1774,1775,1,0,0,0,1775,1777,
        3,94,47,0,1776,1773,1,0,0,0,1776,1777,1,0,0,0,1777,181,1,0,0,0,1778,
        1779,3,106,53,0,1779,183,1,0,0,0,1780,1782,5,3,0,0,1781,1783,5,140,
        0,0,1782,1781,1,0,0,0,1782,1783,1,0,0,0,1783,1784,1,0,0,0,1784,1786,
        3,132,66,0,1785,1787,5,140,0,0,1786,1785,1,0,0,0,1786,1787,1,0,0,
        0,1787,1788,1,0,0,0,1788,1789,5,5,0,0,1789,185,1,0,0,0,1790,1791,
        3,206,103,0,1791,1792,5,140,0,0,1792,1793,5,93,0,0,1793,1794,5,140,
        0,0,1794,1795,3,132,66,0,1795,187,1,0,0,0,1796,1798,5,105,0,0,1797,
        1799,5,140,0,0,1798,1797,1,0,0,0,1798,1799,1,0,0,0,1799,1800,1,0,
        0,0,1800,1802,5,3,0,0,1801,1803,5,140,0,0,1802,1801,1,0,0,0,1802,
        1803,1,0,0,0,1803,1804,1,0,0,0,1804,1806,3,206,103,0,1805,1807,5,
        140,0,0,1806,1805,1,0,0,0,1806,1807,1,0,0,0,1807,1808,1,0,0,0,1808,
        1810,5,9,0,0,1809,1811,5,140,0,0,1810,1809,1,0,0,0,1810,1811,1,0,
        0,0,1811,1812,1,0,0,0,1812,1814,3,132,66,0,1813,1815,5,140,0,0,1814,
        1813,1,0,0,0,1814,1815,1,0,0,0,1815,1816,1,0,0,0,1816,1818,5,4,0,
        0,1817,1819,5,140,0,0,1818,1817,1,0,0,0,1818,1819,1,0,0,0,1819,1820,
        1,0,0,0,1820,1822,3,186,93,0,1821,1823,5,140,0,0,1822,1821,1,0,0,
        0,1822,1823,1,0,0,0,1823,1824,1,0,0,0,1824,1826,5,6,0,0,1825,1827,
        5,140,0,0,1826,1825,1,0,0,0,1826,1827,1,0,0,0,1827,1828,1,0,0,0,
        1828,1830,3,132,66,0,1829,1831,5,140,0,0,1830,1829,1,0,0,0,1830,
        1831,1,0,0,0,1831,1832,1,0,0,0,1832,1833,5,5,0,0,1833,189,1,0,0,
        0,1834,1836,3,192,96,0,1835,1837,5,140,0,0,1836,1835,1,0,0,0,1836,
        1837,1,0,0,0,1837,1838,1,0,0,0,1838,1840,5,3,0,0,1839,1841,5,140,
        0,0,1840,1839,1,0,0,0,1840,1841,1,0,0,0,1841,1846,1,0,0,0,1842,1844,
        5,74,0,0,1843,1845,5,140,0,0,1844,1843,1,0,0,0,1844,1845,1,0,0,0,
        1845,1847,1,0,0,0,1846,1842,1,0,0,0,1846,1847,1,0,0,0,1847,1865,
        1,0,0,0,1848,1850,3,132,66,0,1849,1851,5,140,0,0,1850,1849,1,0,0,
        0,1850,1851,1,0,0,0,1851,1862,1,0,0,0,1852,1854,5,4,0,0,1853,1855,
        5,140,0,0,1854,1853,1,0,0,0,1854,1855,1,0,0,0,1855,1856,1,0,0,0,
        1856,1858,3,132,66,0,1857,1859,5,140,0,0,1858,1857,1,0,0,0,1858,
        1859,1,0,0,0,1859,1861,1,0,0,0,1860,1852,1,0,0,0,1861,1864,1,0,0,
        0,1862,1860,1,0,0,0,1862,1863,1,0,0,0,1863,1866,1,0,0,0,1864,1862,
        1,0,0,0,1865,1848,1,0,0,0,1865,1866,1,0,0,0,1866,1867,1,0,0,0,1867,
        1868,5,5,0,0,1868,191,1,0,0,0,1869,1870,3,204,102,0,1870,1871,3,
        230,115,0,1871,193,1,0,0,0,1872,1874,5,106,0,0,1873,1875,5,140,0,
        0,1874,1873,1,0,0,0,1874,1875,1,0,0,0,1875,1876,1,0,0,0,1876,1878,
        5,7,0,0,1877,1879,5,140,0,0,1878,1877,1,0,0,0,1878,1879,1,0,0,0,
        1879,1896,1,0,0,0,1880,1897,3,24,12,0,1881,1883,3,36,18,0,1882,1884,
        5,140,0,0,1883,1882,1,0,0,0,1883,1884,1,0,0,0,1884,1886,1,0,0,0,
        1885,1881,1,0,0,0,1886,1887,1,0,0,0,1887,1885,1,0,0,0,1887,1888,
        1,0,0,0,1888,1897,1,0,0,0,1889,1894,3,96,48,0,1890,1892,5,140,0,
        0,1891,1890,1,0,0,0,1891,1892,1,0,0,0,1892,1893,1,0,0,0,1893,1895,
        3,94,47,0,1894,1891,1,0,0,0,1894,1895,1,0,0,0,1895,1897,1,0,0,0,
        1896,1880,1,0,0,0,1896,1885,1,0,0,0,1896,1889,1,0,0,0,1897,1899,
        1,0,0,0,1898,1900,5,140,0,0,1899,1898,1,0,0,0,1899,1900,1,0,0,0,
        1900,1901,1,0,0,0,1901,1902,5,8,0,0,1902,195,1,0,0,0,1903,1905,3,
        202,101,0,1904,1906,5,140,0,0,1905,1904,1,0,0,0,1905,1906,1,0,0,
        0,1906,1907,1,0,0,0,1907,1909,5,3,0,0,1908,1910,5,140,0,0,1909,1908,
        1,0,0,0,1909,1910,1,0,0,0,1910,1928,1,0,0,0,1911,1913,3,132,66,0,
        1912,1914,5,140,0,0,1913,1912,1,0,0,0,1913,1914,1,0,0,0,1914,1925,
        1,0,0,0,1915,1917,5,4,0,0,1916,1918,5,140,0,0,1917,1916,1,0,0,0,
        1917,1918,1,0,0,0,1918,1919,1,0,0,0,1919,1921,3,132,66,0,1920,1922,
        5,140,0,0,1921,1920,1,0,0,0,1921,1922,1,0,0,0,1922,1924,1,0,0,0,
        1923,1915,1,0,0,0,1924,1927,1,0,0,0,1925,1923,1,0,0,0,1925,1926,
        1,0,0,0,1926,1929,1,0,0,0,1927,1925,1,0,0,0,1928,1911,1,0,0,0,1928,
        1929,1,0,0,0,1929,1930,1,0,0,0,1930,1931,5,5,0,0,1931,197,1,0,0,
        0,1932,1933,3,202,101,0,1933,199,1,0,0,0,1934,1935,3,230,115,0,1935,
        201,1,0,0,0,1936,1937,3,204,102,0,1937,1938,3,230,115,0,1938,203,
        1,0,0,0,1939,1940,3,230,115,0,1940,1941,5,12,0,0,1941,1943,1,0,0,
        0,1942,1939,1,0,0,0,1943,1946,1,0,0,0,1944,1942,1,0,0,0,1944,1945,
        1,0,0,0,1945,205,1,0,0,0,1946,1944,1,0,0,0,1947,1948,3,230,115,0,
        1948,207,1,0,0,0,1949,1956,3,210,105,0,1950,1956,5,95,0,0,1951,1956,
        3,212,106,0,1952,1956,5,121,0,0,1953,1956,3,218,109,0,1954,1956,
        3,220,110,0,1955,1949,1,0,0,0,1955,1950,1,0,0,0,1955,1951,1,0,0,
        0,1955,1952,1,0,0,0,1955,1953,1,0,0,0,1955,1954,1,0,0,0,1956,209,
        1,0,0,0,1957,1958,7,4,0,0,1958,211,1,0,0,0,1959,1962,3,216,108,0,
        1960,1962,3,214,107,0,1961,1959,1,0,0,0,1961,1960,1,0,0,0,1962,213,
        1,0,0,0,1963,1964,7,5,0,0,1964,215,1,0,0,0,1965,1966,7,6,0,0,1966,
        217,1,0,0,0,1967,1969,5,13,0,0,1968,1970,5,140,0,0,1969,1968,1,0,
        0,0,1969,1970,1,0,0,0,1970,1988,1,0,0,0,1971,1973,3,132,66,0,1972,
        1974,5,140,0,0,1973,1972,1,0,0,0,1973,1974,1,0,0,0,1974,1985,1,0,
        0,0,1975,1977,5,4,0,0,1976,1978,5,140,0,0,1977,1976,1,0,0,0,1977,
        1978,1,0,0,0,1978,1979,1,0,0,0,1979,1981,3,132,66,0,1980,1982,5,
        140,0,0,1981,1980,1,0,0,0,1981,1982,1,0,0,0,1982,1984,1,0,0,0,1983,
        1975,1,0,0,0,1984,1987,1,0,0,0,1985,1983,1,0,0,0,1985,1986,1,0,0,
        0,1986,1989,1,0,0,0,1987,1985,1,0,0,0,1988,1971,1,0,0,0,1988,1989,
        1,0,0,0,1989,1990,1,0,0,0,1990,1991,5,14,0,0,1991,219,1,0,0,0,1992,
        1994,5,7,0,0,1993,1995,5,140,0,0,1994,1993,1,0,0,0,1994,1995,1,0,
        0,0,1995,2029,1,0,0,0,1996,1998,3,222,111,0,1997,1999,5,140,0,0,
        1998,1997,1,0,0,0,1998,1999,1,0,0,0,1999,2000,1,0,0,0,2000,2002,
        5,2,0,0,2001,2003,5,140,0,0,2002,2001,1,0,0,0,2002,2003,1,0,0,0,
        2003,2004,1,0,0,0,2004,2006,3,132,66,0,2005,2007,5,140,0,0,2006,
        2005,1,0,0,0,2006,2007,1,0,0,0,2007,2026,1,0,0,0,2008,2010,5,4,0,
        0,2009,2011,5,140,0,0,2010,2009,1,0,0,0,2010,2011,1,0,0,0,2011,2012,
        1,0,0,0,2012,2014,3,222,111,0,2013,2015,5,140,0,0,2014,2013,1,0,
        0,0,2014,2015,1,0,0,0,2015,2016,1,0,0,0,2016,2018,5,2,0,0,2017,2019,
        5,140,0,0,2018,2017,1,0,0,0,2018,2019,1,0,0,0,2019,2020,1,0,0,0,
        2020,2022,3,132,66,0,2021,2023,5,140,0,0,2022,2021,1,0,0,0,2022,
        2023,1,0,0,0,2023,2025,1,0,0,0,2024,2008,1,0,0,0,2025,2028,1,0,0,
        0,2026,2024,1,0,0,0,2026,2027,1,0,0,0,2027,2030,1,0,0,0,2028,2026,
        1,0,0,0,2029,1996,1,0,0,0,2029,2030,1,0,0,0,2030,2031,1,0,0,0,2031,
        2032,5,8,0,0,2032,221,1,0,0,0,2033,2034,3,226,113,0,2034,223,1,0,
        0,0,2035,2038,5,26,0,0,2036,2039,3,230,115,0,2037,2039,5,110,0,0,
        2038,2036,1,0,0,0,2038,2037,1,0,0,0,2039,225,1,0,0,0,2040,2043,3,
        230,115,0,2041,2043,3,228,114,0,2042,2040,1,0,0,0,2042,2041,1,0,
        0,0,2043,227,1,0,0,0,2044,2045,7,7,0,0,2045,229,1,0,0,0,2046,2047,
        7,8,0,0,2047,231,1,0,0,0,2048,2050,3,226,113,0,2049,2051,5,140,0,
        0,2050,2049,1,0,0,0,2050,2051,1,0,0,0,2051,2052,1,0,0,0,2052,2054,
        5,9,0,0,2053,2055,5,140,0,0,2054,2053,1,0,0,0,2054,2055,1,0,0,0,
        2055,2056,1,0,0,0,2056,2057,3,132,66,0,2057,233,1,0,0,0,2058,2059,
        7,9,0,0,2059,235,1,0,0,0,2060,2061,7,10,0,0,2061,237,1,0,0,0,2062,
        2063,7,11,0,0,2063,239,1,0,0,0,381,241,250,255,259,262,265,274,280,
        288,292,296,300,304,308,311,317,321,325,329,337,341,345,349,353,
        361,365,369,373,381,385,389,393,401,405,409,413,417,423,427,431,
        435,440,444,454,462,466,471,476,484,492,496,501,506,516,520,525,
        532,537,540,544,548,552,558,562,567,572,576,579,581,585,589,594,
        598,603,607,618,625,634,648,652,656,664,668,673,676,682,686,690,
        696,700,704,707,711,721,728,741,745,751,755,759,764,769,773,779,
        783,789,793,799,803,807,811,815,819,824,831,835,840,847,853,858,
        864,867,873,875,879,883,888,892,895,902,909,912,918,921,927,931,
        935,939,943,948,953,957,962,965,975,978,980,984,988,992,997,1000,
        1003,1009,1014,1019,1023,1028,1037,1042,1055,1058,1066,1070,1075,
        1080,1084,1089,1093,1097,1101,1105,1111,1116,1123,1127,1132,1136,
        1140,1142,1146,1148,1152,1154,1160,1166,1170,1173,1176,1180,1186,
        1190,1193,1196,1202,1205,1208,1212,1218,1221,1224,1228,1232,1236,
        1238,1242,1244,1247,1251,1253,1259,1263,1267,1271,1274,1279,1284,
        1289,1294,1300,1304,1306,1310,1314,1316,1318,1326,1331,1342,1352,
        1362,1367,1371,1378,1383,1388,1393,1398,1403,1408,1413,1416,1422,
        1424,1437,1440,1447,1461,1465,1469,1473,1477,1480,1482,1487,1491,
        1495,1499,1503,1507,1510,1512,1517,1521,1526,1532,1535,1539,1543,
        1546,1548,1552,1555,1563,1567,1570,1574,1583,1587,1591,1604,1608,
        1613,1617,1621,1626,1628,1631,1635,1638,1641,1647,1651,1655,1661,
        1665,1669,1672,1675,1681,1685,1689,1691,1695,1699,1701,1705,1709,
        1715,1719,1723,1729,1733,1737,1743,1747,1751,1757,1761,1765,1769,
        1773,1776,1782,1786,1798,1802,1806,1810,1814,1818,1822,1826,1830,
        1836,1840,1844,1846,1850,1854,1858,1862,1865,1874,1878,1883,1887,
        1891,1894,1896,1899,1905,1909,1913,1917,1921,1925,1928,1944,1955,
        1961,1969,1973,1977,1981,1985,1988,1994,1998,2002,2006,2010,2014,
        2018,2022,2026,2029,2038,2042,2050,2054
    ];

    private static __ATN: antlr.ATN;
    public static get _ATN(): antlr.ATN {
        if (!CypherParser.__ATN) {
            CypherParser.__ATN = new antlr.ATNDeserializer().deserialize(CypherParser._serializedATN);
        }

        return CypherParser.__ATN;
    }


    private static readonly vocabulary = new antlr.Vocabulary(CypherParser.literalNames, CypherParser.symbolicNames, []);

    public override get vocabulary(): antlr.Vocabulary {
        return CypherParser.vocabulary;
    }

    private static readonly decisionsToDFA = CypherParser._ATN.decisionToState.map( (ds: antlr.DecisionState, index: number) => new antlr.DFA(ds, index) );
}

export class OC_CypherContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_Statement(): OC_StatementContext {
        return this.getRuleContext(0, OC_StatementContext)!;
    }
    public EOF(): antlr.TerminalNode {
        return this.getToken(CypherParser.EOF, 0)!;
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public CYPHER(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.CYPHER, 0);
    }
    public oC_ParameterHeader(): OC_ParameterHeaderContext[];
    public oC_ParameterHeader(i: number): OC_ParameterHeaderContext | null;
    public oC_ParameterHeader(i?: number): OC_ParameterHeaderContext[] | OC_ParameterHeaderContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_ParameterHeaderContext);
        }

        return this.getRuleContext(i, OC_ParameterHeaderContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_Cypher;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_Cypher) {
             listener.enterOC_Cypher(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_Cypher) {
             listener.exitOC_Cypher(this);
        }
    }
}


export class OC_StatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_Query(): OC_QueryContext {
        return this.getRuleContext(0, OC_QueryContext)!;
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_Statement;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_Statement) {
             listener.enterOC_Statement(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_Statement) {
             listener.exitOC_Statement(this);
        }
    }
}


export class OC_QueryContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_RegularQuery(): OC_RegularQueryContext | null {
        return this.getRuleContext(0, OC_RegularQueryContext);
    }
    public oC_StandaloneCall(): OC_StandaloneCallContext | null {
        return this.getRuleContext(0, OC_StandaloneCallContext);
    }
    public oC_FalkorCommand(): OC_FalkorCommandContext | null {
        return this.getRuleContext(0, OC_FalkorCommandContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_Query;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_Query) {
             listener.enterOC_Query(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_Query) {
             listener.exitOC_Query(this);
        }
    }
}


export class OC_FalkorCommandContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_CreateIndex(): OC_CreateIndexContext | null {
        return this.getRuleContext(0, OC_CreateIndexContext);
    }
    public oC_DropIndex(): OC_DropIndexContext | null {
        return this.getRuleContext(0, OC_DropIndexContext);
    }
    public oC_CreateConstraint(): OC_CreateConstraintContext | null {
        return this.getRuleContext(0, OC_CreateConstraintContext);
    }
    public oC_DropConstraint(): OC_DropConstraintContext | null {
        return this.getRuleContext(0, OC_DropConstraintContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_FalkorCommand;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_FalkorCommand) {
             listener.enterOC_FalkorCommand(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_FalkorCommand) {
             listener.exitOC_FalkorCommand(this);
        }
    }
}


export class OC_CreateIndexContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public CREATE(): antlr.TerminalNode {
        return this.getToken(CypherParser.CREATE, 0)!;
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public oC_IndexQualifier(): OC_IndexQualifierContext | null {
        return this.getRuleContext(0, OC_IndexQualifierContext);
    }
    public INDEX(): antlr.TerminalNode {
        return this.getToken(CypherParser.INDEX, 0)!;
    }
    public FOR(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.FOR, 0);
    }
    public oC_IndexEntity(): OC_IndexEntityContext | null {
        return this.getRuleContext(0, OC_IndexEntityContext);
    }
    public ON(): antlr.TerminalNode {
        return this.getToken(CypherParser.ON, 0)!;
    }
    public oC_IndexProperties(): OC_IndexPropertiesContext {
        return this.getRuleContext(0, OC_IndexPropertiesContext)!;
    }
    public OPTIONS(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.OPTIONS, 0);
    }
    public oC_MapLiteral(): OC_MapLiteralContext | null {
        return this.getRuleContext(0, OC_MapLiteralContext);
    }
    public oC_LabelName(): OC_LabelNameContext | null {
        return this.getRuleContext(0, OC_LabelNameContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_CreateIndex;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_CreateIndex) {
             listener.enterOC_CreateIndex(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_CreateIndex) {
             listener.exitOC_CreateIndex(this);
        }
    }
}


export class OC_DropIndexContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public DROP(): antlr.TerminalNode {
        return this.getToken(CypherParser.DROP, 0)!;
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public oC_IndexQualifier(): OC_IndexQualifierContext | null {
        return this.getRuleContext(0, OC_IndexQualifierContext);
    }
    public INDEX(): antlr.TerminalNode {
        return this.getToken(CypherParser.INDEX, 0)!;
    }
    public FOR(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.FOR, 0);
    }
    public oC_IndexEntity(): OC_IndexEntityContext | null {
        return this.getRuleContext(0, OC_IndexEntityContext);
    }
    public ON(): antlr.TerminalNode {
        return this.getToken(CypherParser.ON, 0)!;
    }
    public oC_IndexProperties(): OC_IndexPropertiesContext {
        return this.getRuleContext(0, OC_IndexPropertiesContext)!;
    }
    public oC_LabelName(): OC_LabelNameContext | null {
        return this.getRuleContext(0, OC_LabelNameContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_DropIndex;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_DropIndex) {
             listener.enterOC_DropIndex(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_DropIndex) {
             listener.exitOC_DropIndex(this);
        }
    }
}


export class OC_IndexQualifierContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public FULLTEXT(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.FULLTEXT, 0);
    }
    public VECTOR(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.VECTOR, 0);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_IndexQualifier;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_IndexQualifier) {
             listener.enterOC_IndexQualifier(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_IndexQualifier) {
             listener.exitOC_IndexQualifier(this);
        }
    }
}


export class OC_IndexEntityContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_NodePattern(): OC_NodePatternContext | null {
        return this.getRuleContext(0, OC_NodePatternContext);
    }
    public oC_RelationshipsPattern(): OC_RelationshipsPatternContext | null {
        return this.getRuleContext(0, OC_RelationshipsPatternContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_IndexEntity;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_IndexEntity) {
             listener.enterOC_IndexEntity(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_IndexEntity) {
             listener.exitOC_IndexEntity(this);
        }
    }
}


export class OC_IndexPropertiesContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_Expression(): OC_ExpressionContext[];
    public oC_Expression(i: number): OC_ExpressionContext | null;
    public oC_Expression(i?: number): OC_ExpressionContext[] | OC_ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_ExpressionContext);
        }

        return this.getRuleContext(i, OC_ExpressionContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_IndexProperties;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_IndexProperties) {
             listener.enterOC_IndexProperties(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_IndexProperties) {
             listener.exitOC_IndexProperties(this);
        }
    }
}


export class OC_CreateConstraintContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public CREATE(): antlr.TerminalNode {
        return this.getToken(CypherParser.CREATE, 0)!;
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public CONSTRAINT(): antlr.TerminalNode {
        return this.getToken(CypherParser.CONSTRAINT, 0)!;
    }
    public ON(): antlr.TerminalNode {
        return this.getToken(CypherParser.ON, 0)!;
    }
    public oC_IndexEntity(): OC_IndexEntityContext {
        return this.getRuleContext(0, OC_IndexEntityContext)!;
    }
    public ASSERT(): antlr.TerminalNode {
        return this.getToken(CypherParser.ASSERT, 0)!;
    }
    public oC_Expression(): OC_ExpressionContext[];
    public oC_Expression(i: number): OC_ExpressionContext | null;
    public oC_Expression(i?: number): OC_ExpressionContext[] | OC_ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_ExpressionContext);
        }

        return this.getRuleContext(i, OC_ExpressionContext);
    }
    public oC_ConstraintPredicate(): OC_ConstraintPredicateContext | null {
        return this.getRuleContext(0, OC_ConstraintPredicateContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_CreateConstraint;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_CreateConstraint) {
             listener.enterOC_CreateConstraint(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_CreateConstraint) {
             listener.exitOC_CreateConstraint(this);
        }
    }
}


export class OC_DropConstraintContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public DROP(): antlr.TerminalNode {
        return this.getToken(CypherParser.DROP, 0)!;
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public CONSTRAINT(): antlr.TerminalNode {
        return this.getToken(CypherParser.CONSTRAINT, 0)!;
    }
    public ON(): antlr.TerminalNode {
        return this.getToken(CypherParser.ON, 0)!;
    }
    public oC_IndexEntity(): OC_IndexEntityContext {
        return this.getRuleContext(0, OC_IndexEntityContext)!;
    }
    public ASSERT(): antlr.TerminalNode {
        return this.getToken(CypherParser.ASSERT, 0)!;
    }
    public oC_Expression(): OC_ExpressionContext[];
    public oC_Expression(i: number): OC_ExpressionContext | null;
    public oC_Expression(i?: number): OC_ExpressionContext[] | OC_ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_ExpressionContext);
        }

        return this.getRuleContext(i, OC_ExpressionContext);
    }
    public oC_ConstraintPredicate(): OC_ConstraintPredicateContext | null {
        return this.getRuleContext(0, OC_ConstraintPredicateContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_DropConstraint;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_DropConstraint) {
             listener.enterOC_DropConstraint(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_DropConstraint) {
             listener.exitOC_DropConstraint(this);
        }
    }
}


export class OC_ConstraintPredicateContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IS(): antlr.TerminalNode {
        return this.getToken(CypherParser.IS, 0)!;
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public UNIQUE(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.UNIQUE, 0);
    }
    public NOT(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.NOT, 0);
    }
    public NULL(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.NULL, 0);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_ConstraintPredicate;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_ConstraintPredicate) {
             listener.enterOC_ConstraintPredicate(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_ConstraintPredicate) {
             listener.exitOC_ConstraintPredicate(this);
        }
    }
}


export class OC_RegularQueryContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_SingleQuery(): OC_SingleQueryContext {
        return this.getRuleContext(0, OC_SingleQueryContext)!;
    }
    public oC_Union(): OC_UnionContext[];
    public oC_Union(i: number): OC_UnionContext | null;
    public oC_Union(i?: number): OC_UnionContext[] | OC_UnionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_UnionContext);
        }

        return this.getRuleContext(i, OC_UnionContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_RegularQuery;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_RegularQuery) {
             listener.enterOC_RegularQuery(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_RegularQuery) {
             listener.exitOC_RegularQuery(this);
        }
    }
}


export class OC_UnionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public UNION(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.UNION, 0);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public ALL(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.ALL, 0);
    }
    public oC_SingleQuery(): OC_SingleQueryContext | null {
        return this.getRuleContext(0, OC_SingleQueryContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_Union;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_Union) {
             listener.enterOC_Union(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_Union) {
             listener.exitOC_Union(this);
        }
    }
}


export class OC_SingleQueryContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_SinglePartQuery(): OC_SinglePartQueryContext | null {
        return this.getRuleContext(0, OC_SinglePartQueryContext);
    }
    public oC_MultiPartQuery(): OC_MultiPartQueryContext | null {
        return this.getRuleContext(0, OC_MultiPartQueryContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_SingleQuery;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_SingleQuery) {
             listener.enterOC_SingleQuery(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_SingleQuery) {
             listener.exitOC_SingleQuery(this);
        }
    }
}


export class OC_SinglePartQueryContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_Return(): OC_ReturnContext | null {
        return this.getRuleContext(0, OC_ReturnContext);
    }
    public oC_ReadingClause(): OC_ReadingClauseContext[];
    public oC_ReadingClause(i: number): OC_ReadingClauseContext | null;
    public oC_ReadingClause(i?: number): OC_ReadingClauseContext[] | OC_ReadingClauseContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_ReadingClauseContext);
        }

        return this.getRuleContext(i, OC_ReadingClauseContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public oC_UpdatingClause(): OC_UpdatingClauseContext[];
    public oC_UpdatingClause(i: number): OC_UpdatingClauseContext | null;
    public oC_UpdatingClause(i?: number): OC_UpdatingClauseContext[] | OC_UpdatingClauseContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_UpdatingClauseContext);
        }

        return this.getRuleContext(i, OC_UpdatingClauseContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_SinglePartQuery;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_SinglePartQuery) {
             listener.enterOC_SinglePartQuery(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_SinglePartQuery) {
             listener.exitOC_SinglePartQuery(this);
        }
    }
}


export class OC_MultiPartQueryContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_SinglePartQuery(): OC_SinglePartQueryContext {
        return this.getRuleContext(0, OC_SinglePartQueryContext)!;
    }
    public oC_With(): OC_WithContext[];
    public oC_With(i: number): OC_WithContext | null;
    public oC_With(i?: number): OC_WithContext[] | OC_WithContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_WithContext);
        }

        return this.getRuleContext(i, OC_WithContext);
    }
    public oC_ReadingClause(): OC_ReadingClauseContext[];
    public oC_ReadingClause(i: number): OC_ReadingClauseContext | null;
    public oC_ReadingClause(i?: number): OC_ReadingClauseContext[] | OC_ReadingClauseContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_ReadingClauseContext);
        }

        return this.getRuleContext(i, OC_ReadingClauseContext);
    }
    public oC_UpdatingClause(): OC_UpdatingClauseContext[];
    public oC_UpdatingClause(i: number): OC_UpdatingClauseContext | null;
    public oC_UpdatingClause(i?: number): OC_UpdatingClauseContext[] | OC_UpdatingClauseContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_UpdatingClauseContext);
        }

        return this.getRuleContext(i, OC_UpdatingClauseContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_MultiPartQuery;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_MultiPartQuery) {
             listener.enterOC_MultiPartQuery(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_MultiPartQuery) {
             listener.exitOC_MultiPartQuery(this);
        }
    }
}


export class OC_UpdatingClauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_Create(): OC_CreateContext | null {
        return this.getRuleContext(0, OC_CreateContext);
    }
    public oC_Merge(): OC_MergeContext | null {
        return this.getRuleContext(0, OC_MergeContext);
    }
    public oC_Delete(): OC_DeleteContext | null {
        return this.getRuleContext(0, OC_DeleteContext);
    }
    public oC_Set(): OC_SetContext | null {
        return this.getRuleContext(0, OC_SetContext);
    }
    public oC_Remove(): OC_RemoveContext | null {
        return this.getRuleContext(0, OC_RemoveContext);
    }
    public oC_Foreach(): OC_ForeachContext | null {
        return this.getRuleContext(0, OC_ForeachContext);
    }
    public oC_CallSubquery(): OC_CallSubqueryContext | null {
        return this.getRuleContext(0, OC_CallSubqueryContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_UpdatingClause;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_UpdatingClause) {
             listener.enterOC_UpdatingClause(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_UpdatingClause) {
             listener.exitOC_UpdatingClause(this);
        }
    }
}


export class OC_ReadingClauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_Match(): OC_MatchContext | null {
        return this.getRuleContext(0, OC_MatchContext);
    }
    public oC_Unwind(): OC_UnwindContext | null {
        return this.getRuleContext(0, OC_UnwindContext);
    }
    public oC_InQueryCall(): OC_InQueryCallContext | null {
        return this.getRuleContext(0, OC_InQueryCallContext);
    }
    public oC_CallSubquery(): OC_CallSubqueryContext | null {
        return this.getRuleContext(0, OC_CallSubqueryContext);
    }
    public oC_LoadCsv(): OC_LoadCsvContext | null {
        return this.getRuleContext(0, OC_LoadCsvContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_ReadingClause;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_ReadingClause) {
             listener.enterOC_ReadingClause(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_ReadingClause) {
             listener.exitOC_ReadingClause(this);
        }
    }
}


export class OC_LoadCsvContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LOAD(): antlr.TerminalNode {
        return this.getToken(CypherParser.LOAD, 0)!;
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public CSV(): antlr.TerminalNode {
        return this.getToken(CypherParser.CSV, 0)!;
    }
    public FROM(): antlr.TerminalNode {
        return this.getToken(CypherParser.FROM, 0)!;
    }
    public oC_Expression(): OC_ExpressionContext {
        return this.getRuleContext(0, OC_ExpressionContext)!;
    }
    public AS(): antlr.TerminalNode {
        return this.getToken(CypherParser.AS, 0)!;
    }
    public oC_Variable(): OC_VariableContext {
        return this.getRuleContext(0, OC_VariableContext)!;
    }
    public WITH(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.WITH, 0);
    }
    public HEADERS(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.HEADERS, 0);
    }
    public FIELDTERMINATOR(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.FIELDTERMINATOR, 0);
    }
    public StringLiteral(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.StringLiteral, 0);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_LoadCsv;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_LoadCsv) {
             listener.enterOC_LoadCsv(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_LoadCsv) {
             listener.exitOC_LoadCsv(this);
        }
    }
}


export class OC_ForeachContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public FOREACH(): antlr.TerminalNode {
        return this.getToken(CypherParser.FOREACH, 0)!;
    }
    public oC_Variable(): OC_VariableContext {
        return this.getRuleContext(0, OC_VariableContext)!;
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public IN(): antlr.TerminalNode {
        return this.getToken(CypherParser.IN, 0)!;
    }
    public oC_Expression(): OC_ExpressionContext {
        return this.getRuleContext(0, OC_ExpressionContext)!;
    }
    public oC_UpdatingClause(): OC_UpdatingClauseContext[];
    public oC_UpdatingClause(i: number): OC_UpdatingClauseContext | null;
    public oC_UpdatingClause(i?: number): OC_UpdatingClauseContext[] | OC_UpdatingClauseContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_UpdatingClauseContext);
        }

        return this.getRuleContext(i, OC_UpdatingClauseContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_Foreach;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_Foreach) {
             listener.enterOC_Foreach(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_Foreach) {
             listener.exitOC_Foreach(this);
        }
    }
}


export class OC_CallSubqueryContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public CALL(): antlr.TerminalNode {
        return this.getToken(CypherParser.CALL, 0)!;
    }
    public oC_RegularQuery(): OC_RegularQueryContext {
        return this.getRuleContext(0, OC_RegularQueryContext)!;
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_CallSubquery;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_CallSubquery) {
             listener.enterOC_CallSubquery(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_CallSubquery) {
             listener.exitOC_CallSubquery(this);
        }
    }
}


export class OC_MatchContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public MATCH(): antlr.TerminalNode {
        return this.getToken(CypherParser.MATCH, 0)!;
    }
    public oC_Pattern(): OC_PatternContext {
        return this.getRuleContext(0, OC_PatternContext)!;
    }
    public OPTIONAL(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.OPTIONAL, 0);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public oC_Where(): OC_WhereContext | null {
        return this.getRuleContext(0, OC_WhereContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_Match;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_Match) {
             listener.enterOC_Match(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_Match) {
             listener.exitOC_Match(this);
        }
    }
}


export class OC_UnwindContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public UNWIND(): antlr.TerminalNode {
        return this.getToken(CypherParser.UNWIND, 0)!;
    }
    public oC_Expression(): OC_ExpressionContext {
        return this.getRuleContext(0, OC_ExpressionContext)!;
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public AS(): antlr.TerminalNode {
        return this.getToken(CypherParser.AS, 0)!;
    }
    public oC_Variable(): OC_VariableContext {
        return this.getRuleContext(0, OC_VariableContext)!;
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_Unwind;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_Unwind) {
             listener.enterOC_Unwind(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_Unwind) {
             listener.exitOC_Unwind(this);
        }
    }
}


export class OC_MergeContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public MERGE(): antlr.TerminalNode {
        return this.getToken(CypherParser.MERGE, 0)!;
    }
    public oC_PatternPart(): OC_PatternPartContext {
        return this.getRuleContext(0, OC_PatternPartContext)!;
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public oC_MergeAction(): OC_MergeActionContext[];
    public oC_MergeAction(i: number): OC_MergeActionContext | null;
    public oC_MergeAction(i?: number): OC_MergeActionContext[] | OC_MergeActionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_MergeActionContext);
        }

        return this.getRuleContext(i, OC_MergeActionContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_Merge;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_Merge) {
             listener.enterOC_Merge(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_Merge) {
             listener.exitOC_Merge(this);
        }
    }
}


export class OC_MergeActionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ON(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.ON, 0);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public MATCH(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.MATCH, 0);
    }
    public oC_Set(): OC_SetContext | null {
        return this.getRuleContext(0, OC_SetContext);
    }
    public CREATE(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.CREATE, 0);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_MergeAction;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_MergeAction) {
             listener.enterOC_MergeAction(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_MergeAction) {
             listener.exitOC_MergeAction(this);
        }
    }
}


export class OC_CreateContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public CREATE(): antlr.TerminalNode {
        return this.getToken(CypherParser.CREATE, 0)!;
    }
    public oC_Pattern(): OC_PatternContext {
        return this.getRuleContext(0, OC_PatternContext)!;
    }
    public SP(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.SP, 0);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_Create;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_Create) {
             listener.enterOC_Create(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_Create) {
             listener.exitOC_Create(this);
        }
    }
}


export class OC_SetContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SET(): antlr.TerminalNode {
        return this.getToken(CypherParser.SET, 0)!;
    }
    public oC_SetItem(): OC_SetItemContext[];
    public oC_SetItem(i: number): OC_SetItemContext | null;
    public oC_SetItem(i?: number): OC_SetItemContext[] | OC_SetItemContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_SetItemContext);
        }

        return this.getRuleContext(i, OC_SetItemContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_Set;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_Set) {
             listener.enterOC_Set(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_Set) {
             listener.exitOC_Set(this);
        }
    }
}


export class OC_SetItemContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_PropertyExpression(): OC_PropertyExpressionContext | null {
        return this.getRuleContext(0, OC_PropertyExpressionContext);
    }
    public oC_Expression(): OC_ExpressionContext | null {
        return this.getRuleContext(0, OC_ExpressionContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public oC_Variable(): OC_VariableContext | null {
        return this.getRuleContext(0, OC_VariableContext);
    }
    public oC_NodeLabels(): OC_NodeLabelsContext | null {
        return this.getRuleContext(0, OC_NodeLabelsContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_SetItem;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_SetItem) {
             listener.enterOC_SetItem(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_SetItem) {
             listener.exitOC_SetItem(this);
        }
    }
}


export class OC_DeleteContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public DELETE(): antlr.TerminalNode {
        return this.getToken(CypherParser.DELETE, 0)!;
    }
    public oC_Expression(): OC_ExpressionContext[];
    public oC_Expression(i: number): OC_ExpressionContext | null;
    public oC_Expression(i?: number): OC_ExpressionContext[] | OC_ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_ExpressionContext);
        }

        return this.getRuleContext(i, OC_ExpressionContext);
    }
    public DETACH(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.DETACH, 0);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_Delete;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_Delete) {
             listener.enterOC_Delete(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_Delete) {
             listener.exitOC_Delete(this);
        }
    }
}


export class OC_RemoveContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public REMOVE(): antlr.TerminalNode {
        return this.getToken(CypherParser.REMOVE, 0)!;
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public oC_RemoveItem(): OC_RemoveItemContext[];
    public oC_RemoveItem(i: number): OC_RemoveItemContext | null;
    public oC_RemoveItem(i?: number): OC_RemoveItemContext[] | OC_RemoveItemContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_RemoveItemContext);
        }

        return this.getRuleContext(i, OC_RemoveItemContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_Remove;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_Remove) {
             listener.enterOC_Remove(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_Remove) {
             listener.exitOC_Remove(this);
        }
    }
}


export class OC_RemoveItemContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_Variable(): OC_VariableContext | null {
        return this.getRuleContext(0, OC_VariableContext);
    }
    public oC_NodeLabels(): OC_NodeLabelsContext | null {
        return this.getRuleContext(0, OC_NodeLabelsContext);
    }
    public oC_PropertyExpression(): OC_PropertyExpressionContext | null {
        return this.getRuleContext(0, OC_PropertyExpressionContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_RemoveItem;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_RemoveItem) {
             listener.enterOC_RemoveItem(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_RemoveItem) {
             listener.exitOC_RemoveItem(this);
        }
    }
}


export class OC_InQueryCallContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public CALL(): antlr.TerminalNode {
        return this.getToken(CypherParser.CALL, 0)!;
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public oC_ExplicitProcedureInvocation(): OC_ExplicitProcedureInvocationContext {
        return this.getRuleContext(0, OC_ExplicitProcedureInvocationContext)!;
    }
    public YIELD(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.YIELD, 0);
    }
    public oC_YieldItems(): OC_YieldItemsContext | null {
        return this.getRuleContext(0, OC_YieldItemsContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_InQueryCall;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_InQueryCall) {
             listener.enterOC_InQueryCall(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_InQueryCall) {
             listener.exitOC_InQueryCall(this);
        }
    }
}


export class OC_StandaloneCallContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public CALL(): antlr.TerminalNode {
        return this.getToken(CypherParser.CALL, 0)!;
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public oC_ExplicitProcedureInvocation(): OC_ExplicitProcedureInvocationContext | null {
        return this.getRuleContext(0, OC_ExplicitProcedureInvocationContext);
    }
    public oC_ImplicitProcedureInvocation(): OC_ImplicitProcedureInvocationContext | null {
        return this.getRuleContext(0, OC_ImplicitProcedureInvocationContext);
    }
    public YIELD(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.YIELD, 0);
    }
    public oC_YieldItems(): OC_YieldItemsContext | null {
        return this.getRuleContext(0, OC_YieldItemsContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_StandaloneCall;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_StandaloneCall) {
             listener.enterOC_StandaloneCall(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_StandaloneCall) {
             listener.exitOC_StandaloneCall(this);
        }
    }
}


export class OC_YieldItemsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_YieldItem(): OC_YieldItemContext[];
    public oC_YieldItem(i: number): OC_YieldItemContext | null;
    public oC_YieldItem(i?: number): OC_YieldItemContext[] | OC_YieldItemContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_YieldItemContext);
        }

        return this.getRuleContext(i, OC_YieldItemContext);
    }
    public oC_Where(): OC_WhereContext | null {
        return this.getRuleContext(0, OC_WhereContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_YieldItems;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_YieldItems) {
             listener.enterOC_YieldItems(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_YieldItems) {
             listener.exitOC_YieldItems(this);
        }
    }
}


export class OC_YieldItemContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_Variable(): OC_VariableContext {
        return this.getRuleContext(0, OC_VariableContext)!;
    }
    public oC_ProcedureResultField(): OC_ProcedureResultFieldContext | null {
        return this.getRuleContext(0, OC_ProcedureResultFieldContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public AS(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.AS, 0);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_YieldItem;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_YieldItem) {
             listener.enterOC_YieldItem(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_YieldItem) {
             listener.exitOC_YieldItem(this);
        }
    }
}


export class OC_WithContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public WITH(): antlr.TerminalNode {
        return this.getToken(CypherParser.WITH, 0)!;
    }
    public oC_ProjectionBody(): OC_ProjectionBodyContext {
        return this.getRuleContext(0, OC_ProjectionBodyContext)!;
    }
    public oC_Where(): OC_WhereContext | null {
        return this.getRuleContext(0, OC_WhereContext);
    }
    public SP(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.SP, 0);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_With;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_With) {
             listener.enterOC_With(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_With) {
             listener.exitOC_With(this);
        }
    }
}


export class OC_ReturnContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public RETURN(): antlr.TerminalNode {
        return this.getToken(CypherParser.RETURN, 0)!;
    }
    public oC_ProjectionBody(): OC_ProjectionBodyContext {
        return this.getRuleContext(0, OC_ProjectionBodyContext)!;
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_Return;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_Return) {
             listener.enterOC_Return(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_Return) {
             listener.exitOC_Return(this);
        }
    }
}


export class OC_ProjectionBodyContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public oC_ProjectionItems(): OC_ProjectionItemsContext {
        return this.getRuleContext(0, OC_ProjectionItemsContext)!;
    }
    public DISTINCT(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.DISTINCT, 0);
    }
    public oC_Order(): OC_OrderContext | null {
        return this.getRuleContext(0, OC_OrderContext);
    }
    public oC_Skip(): OC_SkipContext | null {
        return this.getRuleContext(0, OC_SkipContext);
    }
    public oC_Limit(): OC_LimitContext | null {
        return this.getRuleContext(0, OC_LimitContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_ProjectionBody;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_ProjectionBody) {
             listener.enterOC_ProjectionBody(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_ProjectionBody) {
             listener.exitOC_ProjectionBody(this);
        }
    }
}


export class OC_ProjectionItemsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_ProjectionItem(): OC_ProjectionItemContext[];
    public oC_ProjectionItem(i: number): OC_ProjectionItemContext | null;
    public oC_ProjectionItem(i?: number): OC_ProjectionItemContext[] | OC_ProjectionItemContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_ProjectionItemContext);
        }

        return this.getRuleContext(i, OC_ProjectionItemContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_ProjectionItems;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_ProjectionItems) {
             listener.enterOC_ProjectionItems(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_ProjectionItems) {
             listener.exitOC_ProjectionItems(this);
        }
    }
}


export class OC_ProjectionItemContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_Expression(): OC_ExpressionContext | null {
        return this.getRuleContext(0, OC_ExpressionContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public AS(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.AS, 0);
    }
    public oC_Variable(): OC_VariableContext | null {
        return this.getRuleContext(0, OC_VariableContext);
    }
    public oC_MapProjection(): OC_MapProjectionContext | null {
        return this.getRuleContext(0, OC_MapProjectionContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_ProjectionItem;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_ProjectionItem) {
             listener.enterOC_ProjectionItem(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_ProjectionItem) {
             listener.exitOC_ProjectionItem(this);
        }
    }
}


export class OC_MapProjectionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public oC_MapProjectionElement(): OC_MapProjectionElementContext[];
    public oC_MapProjectionElement(i: number): OC_MapProjectionElementContext | null;
    public oC_MapProjectionElement(i?: number): OC_MapProjectionElementContext[] | OC_MapProjectionElementContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_MapProjectionElementContext);
        }

        return this.getRuleContext(i, OC_MapProjectionElementContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_MapProjection;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_MapProjection) {
             listener.enterOC_MapProjection(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_MapProjection) {
             listener.exitOC_MapProjection(this);
        }
    }
}


export class OC_MapProjectionElementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public oC_PropertyKeyName(): OC_PropertyKeyNameContext | null {
        return this.getRuleContext(0, OC_PropertyKeyNameContext);
    }
    public oC_Expression(): OC_ExpressionContext | null {
        return this.getRuleContext(0, OC_ExpressionContext);
    }
    public oC_Variable(): OC_VariableContext | null {
        return this.getRuleContext(0, OC_VariableContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_MapProjectionElement;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_MapProjectionElement) {
             listener.enterOC_MapProjectionElement(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_MapProjectionElement) {
             listener.exitOC_MapProjectionElement(this);
        }
    }
}


export class OC_OrderContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ORDER(): antlr.TerminalNode {
        return this.getToken(CypherParser.ORDER, 0)!;
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public BY(): antlr.TerminalNode {
        return this.getToken(CypherParser.BY, 0)!;
    }
    public oC_SortItem(): OC_SortItemContext[];
    public oC_SortItem(i: number): OC_SortItemContext | null;
    public oC_SortItem(i?: number): OC_SortItemContext[] | OC_SortItemContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_SortItemContext);
        }

        return this.getRuleContext(i, OC_SortItemContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_Order;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_Order) {
             listener.enterOC_Order(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_Order) {
             listener.exitOC_Order(this);
        }
    }
}


export class OC_SkipContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public L_SKIP(): antlr.TerminalNode {
        return this.getToken(CypherParser.L_SKIP, 0)!;
    }
    public SP(): antlr.TerminalNode {
        return this.getToken(CypherParser.SP, 0)!;
    }
    public oC_Expression(): OC_ExpressionContext {
        return this.getRuleContext(0, OC_ExpressionContext)!;
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_Skip;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_Skip) {
             listener.enterOC_Skip(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_Skip) {
             listener.exitOC_Skip(this);
        }
    }
}


export class OC_LimitContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LIMIT(): antlr.TerminalNode {
        return this.getToken(CypherParser.LIMIT, 0)!;
    }
    public SP(): antlr.TerminalNode {
        return this.getToken(CypherParser.SP, 0)!;
    }
    public oC_Expression(): OC_ExpressionContext {
        return this.getRuleContext(0, OC_ExpressionContext)!;
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_Limit;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_Limit) {
             listener.enterOC_Limit(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_Limit) {
             listener.exitOC_Limit(this);
        }
    }
}


export class OC_SortItemContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_Expression(): OC_ExpressionContext {
        return this.getRuleContext(0, OC_ExpressionContext)!;
    }
    public ASCENDING(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.ASCENDING, 0);
    }
    public ASC(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.ASC, 0);
    }
    public DESCENDING(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.DESCENDING, 0);
    }
    public DESC(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.DESC, 0);
    }
    public SP(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.SP, 0);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_SortItem;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_SortItem) {
             listener.enterOC_SortItem(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_SortItem) {
             listener.exitOC_SortItem(this);
        }
    }
}


export class OC_WhereContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public WHERE(): antlr.TerminalNode {
        return this.getToken(CypherParser.WHERE, 0)!;
    }
    public SP(): antlr.TerminalNode {
        return this.getToken(CypherParser.SP, 0)!;
    }
    public oC_Expression(): OC_ExpressionContext {
        return this.getRuleContext(0, OC_ExpressionContext)!;
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_Where;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_Where) {
             listener.enterOC_Where(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_Where) {
             listener.exitOC_Where(this);
        }
    }
}


export class OC_PatternContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_PatternPart(): OC_PatternPartContext[];
    public oC_PatternPart(i: number): OC_PatternPartContext | null;
    public oC_PatternPart(i?: number): OC_PatternPartContext[] | OC_PatternPartContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_PatternPartContext);
        }

        return this.getRuleContext(i, OC_PatternPartContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_Pattern;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_Pattern) {
             listener.enterOC_Pattern(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_Pattern) {
             listener.exitOC_Pattern(this);
        }
    }
}


export class OC_PatternPartContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_Variable(): OC_VariableContext | null {
        return this.getRuleContext(0, OC_VariableContext);
    }
    public oC_AnonymousPatternPart(): OC_AnonymousPatternPartContext | null {
        return this.getRuleContext(0, OC_AnonymousPatternPartContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_PatternPart;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_PatternPart) {
             listener.enterOC_PatternPart(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_PatternPart) {
             listener.exitOC_PatternPart(this);
        }
    }
}


export class OC_AnonymousPatternPartContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_ShortestPathPattern(): OC_ShortestPathPatternContext | null {
        return this.getRuleContext(0, OC_ShortestPathPatternContext);
    }
    public oC_PatternElement(): OC_PatternElementContext | null {
        return this.getRuleContext(0, OC_PatternElementContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_AnonymousPatternPart;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_AnonymousPatternPart) {
             listener.enterOC_AnonymousPatternPart(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_AnonymousPatternPart) {
             listener.exitOC_AnonymousPatternPart(this);
        }
    }
}


export class OC_ShortestPathPatternContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_PatternElement(): OC_PatternElementContext {
        return this.getRuleContext(0, OC_PatternElementContext)!;
    }
    public SHORTESTPATH(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.SHORTESTPATH, 0);
    }
    public ALLSHORTESTPATHS(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.ALLSHORTESTPATHS, 0);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_ShortestPathPattern;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_ShortestPathPattern) {
             listener.enterOC_ShortestPathPattern(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_ShortestPathPattern) {
             listener.exitOC_ShortestPathPattern(this);
        }
    }
}


export class OC_PatternElementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_NodePattern(): OC_NodePatternContext | null {
        return this.getRuleContext(0, OC_NodePatternContext);
    }
    public oC_PatternElementChain(): OC_PatternElementChainContext[];
    public oC_PatternElementChain(i: number): OC_PatternElementChainContext | null;
    public oC_PatternElementChain(i?: number): OC_PatternElementChainContext[] | OC_PatternElementChainContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_PatternElementChainContext);
        }

        return this.getRuleContext(i, OC_PatternElementChainContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public oC_PatternElement(): OC_PatternElementContext | null {
        return this.getRuleContext(0, OC_PatternElementContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_PatternElement;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_PatternElement) {
             listener.enterOC_PatternElement(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_PatternElement) {
             listener.exitOC_PatternElement(this);
        }
    }
}


export class OC_RelationshipsPatternContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_NodePattern(): OC_NodePatternContext {
        return this.getRuleContext(0, OC_NodePatternContext)!;
    }
    public oC_PatternElementChain(): OC_PatternElementChainContext[];
    public oC_PatternElementChain(i: number): OC_PatternElementChainContext | null;
    public oC_PatternElementChain(i?: number): OC_PatternElementChainContext[] | OC_PatternElementChainContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_PatternElementChainContext);
        }

        return this.getRuleContext(i, OC_PatternElementChainContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_RelationshipsPattern;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_RelationshipsPattern) {
             listener.enterOC_RelationshipsPattern(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_RelationshipsPattern) {
             listener.exitOC_RelationshipsPattern(this);
        }
    }
}


export class OC_NodePatternContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public oC_Variable(): OC_VariableContext | null {
        return this.getRuleContext(0, OC_VariableContext);
    }
    public oC_NodeLabels(): OC_NodeLabelsContext | null {
        return this.getRuleContext(0, OC_NodeLabelsContext);
    }
    public oC_Properties(): OC_PropertiesContext | null {
        return this.getRuleContext(0, OC_PropertiesContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_NodePattern;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_NodePattern) {
             listener.enterOC_NodePattern(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_NodePattern) {
             listener.exitOC_NodePattern(this);
        }
    }
}


export class OC_PatternElementChainContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_RelationshipPattern(): OC_RelationshipPatternContext {
        return this.getRuleContext(0, OC_RelationshipPatternContext)!;
    }
    public oC_NodePattern(): OC_NodePatternContext {
        return this.getRuleContext(0, OC_NodePatternContext)!;
    }
    public SP(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.SP, 0);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_PatternElementChain;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_PatternElementChain) {
             listener.enterOC_PatternElementChain(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_PatternElementChain) {
             listener.exitOC_PatternElementChain(this);
        }
    }
}


export class OC_RelationshipPatternContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_LeftArrowHead(): OC_LeftArrowHeadContext | null {
        return this.getRuleContext(0, OC_LeftArrowHeadContext);
    }
    public oC_Dash(): OC_DashContext[];
    public oC_Dash(i: number): OC_DashContext | null;
    public oC_Dash(i?: number): OC_DashContext[] | OC_DashContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_DashContext);
        }

        return this.getRuleContext(i, OC_DashContext);
    }
    public oC_RightArrowHead(): OC_RightArrowHeadContext | null {
        return this.getRuleContext(0, OC_RightArrowHeadContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public oC_RelationshipDetail(): OC_RelationshipDetailContext | null {
        return this.getRuleContext(0, OC_RelationshipDetailContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_RelationshipPattern;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_RelationshipPattern) {
             listener.enterOC_RelationshipPattern(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_RelationshipPattern) {
             listener.exitOC_RelationshipPattern(this);
        }
    }
}


export class OC_RelationshipDetailContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public oC_Variable(): OC_VariableContext | null {
        return this.getRuleContext(0, OC_VariableContext);
    }
    public oC_RelationshipTypes(): OC_RelationshipTypesContext | null {
        return this.getRuleContext(0, OC_RelationshipTypesContext);
    }
    public oC_RangeLiteral(): OC_RangeLiteralContext | null {
        return this.getRuleContext(0, OC_RangeLiteralContext);
    }
    public oC_Properties(): OC_PropertiesContext | null {
        return this.getRuleContext(0, OC_PropertiesContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_RelationshipDetail;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_RelationshipDetail) {
             listener.enterOC_RelationshipDetail(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_RelationshipDetail) {
             listener.exitOC_RelationshipDetail(this);
        }
    }
}


export class OC_PropertiesContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_MapLiteral(): OC_MapLiteralContext | null {
        return this.getRuleContext(0, OC_MapLiteralContext);
    }
    public oC_Parameter(): OC_ParameterContext | null {
        return this.getRuleContext(0, OC_ParameterContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_Properties;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_Properties) {
             listener.enterOC_Properties(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_Properties) {
             listener.exitOC_Properties(this);
        }
    }
}


export class OC_RelationshipTypesContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_RelTypeName(): OC_RelTypeNameContext[];
    public oC_RelTypeName(i: number): OC_RelTypeNameContext | null;
    public oC_RelTypeName(i?: number): OC_RelTypeNameContext[] | OC_RelTypeNameContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_RelTypeNameContext);
        }

        return this.getRuleContext(i, OC_RelTypeNameContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_RelationshipTypes;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_RelationshipTypes) {
             listener.enterOC_RelationshipTypes(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_RelationshipTypes) {
             listener.exitOC_RelationshipTypes(this);
        }
    }
}


export class OC_NodeLabelsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_NodeLabel(): OC_NodeLabelContext[];
    public oC_NodeLabel(i: number): OC_NodeLabelContext | null;
    public oC_NodeLabel(i?: number): OC_NodeLabelContext[] | OC_NodeLabelContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_NodeLabelContext);
        }

        return this.getRuleContext(i, OC_NodeLabelContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_NodeLabels;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_NodeLabels) {
             listener.enterOC_NodeLabels(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_NodeLabels) {
             listener.exitOC_NodeLabels(this);
        }
    }
}


export class OC_NodeLabelContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_LabelName(): OC_LabelNameContext {
        return this.getRuleContext(0, OC_LabelNameContext)!;
    }
    public SP(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.SP, 0);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_NodeLabel;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_NodeLabel) {
             listener.enterOC_NodeLabel(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_NodeLabel) {
             listener.exitOC_NodeLabel(this);
        }
    }
}


export class OC_RangeLiteralContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public oC_IntegerLiteral(): OC_IntegerLiteralContext[];
    public oC_IntegerLiteral(i: number): OC_IntegerLiteralContext | null;
    public oC_IntegerLiteral(i?: number): OC_IntegerLiteralContext[] | OC_IntegerLiteralContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_IntegerLiteralContext);
        }

        return this.getRuleContext(i, OC_IntegerLiteralContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_RangeLiteral;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_RangeLiteral) {
             listener.enterOC_RangeLiteral(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_RangeLiteral) {
             listener.exitOC_RangeLiteral(this);
        }
    }
}


export class OC_LabelNameContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_SchemaName(): OC_SchemaNameContext {
        return this.getRuleContext(0, OC_SchemaNameContext)!;
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_LabelName;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_LabelName) {
             listener.enterOC_LabelName(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_LabelName) {
             listener.exitOC_LabelName(this);
        }
    }
}


export class OC_RelTypeNameContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_SchemaName(): OC_SchemaNameContext {
        return this.getRuleContext(0, OC_SchemaNameContext)!;
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_RelTypeName;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_RelTypeName) {
             listener.enterOC_RelTypeName(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_RelTypeName) {
             listener.exitOC_RelTypeName(this);
        }
    }
}


export class OC_PropertyExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_Atom(): OC_AtomContext {
        return this.getRuleContext(0, OC_AtomContext)!;
    }
    public oC_PropertyLookup(): OC_PropertyLookupContext[];
    public oC_PropertyLookup(i: number): OC_PropertyLookupContext | null;
    public oC_PropertyLookup(i?: number): OC_PropertyLookupContext[] | OC_PropertyLookupContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_PropertyLookupContext);
        }

        return this.getRuleContext(i, OC_PropertyLookupContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_PropertyExpression;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_PropertyExpression) {
             listener.enterOC_PropertyExpression(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_PropertyExpression) {
             listener.exitOC_PropertyExpression(this);
        }
    }
}


export class OC_ExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_OrExpression(): OC_OrExpressionContext {
        return this.getRuleContext(0, OC_OrExpressionContext)!;
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_Expression;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_Expression) {
             listener.enterOC_Expression(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_Expression) {
             listener.exitOC_Expression(this);
        }
    }
}


export class OC_OrExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_XorExpression(): OC_XorExpressionContext[];
    public oC_XorExpression(i: number): OC_XorExpressionContext | null;
    public oC_XorExpression(i?: number): OC_XorExpressionContext[] | OC_XorExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_XorExpressionContext);
        }

        return this.getRuleContext(i, OC_XorExpressionContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public OR(): antlr.TerminalNode[];
    public OR(i: number): antlr.TerminalNode | null;
    public OR(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.OR);
        } else {
            return this.getToken(CypherParser.OR, i);
        }
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_OrExpression;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_OrExpression) {
             listener.enterOC_OrExpression(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_OrExpression) {
             listener.exitOC_OrExpression(this);
        }
    }
}


export class OC_XorExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_AndExpression(): OC_AndExpressionContext[];
    public oC_AndExpression(i: number): OC_AndExpressionContext | null;
    public oC_AndExpression(i?: number): OC_AndExpressionContext[] | OC_AndExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_AndExpressionContext);
        }

        return this.getRuleContext(i, OC_AndExpressionContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public XOR(): antlr.TerminalNode[];
    public XOR(i: number): antlr.TerminalNode | null;
    public XOR(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.XOR);
        } else {
            return this.getToken(CypherParser.XOR, i);
        }
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_XorExpression;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_XorExpression) {
             listener.enterOC_XorExpression(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_XorExpression) {
             listener.exitOC_XorExpression(this);
        }
    }
}


export class OC_AndExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_NotExpression(): OC_NotExpressionContext[];
    public oC_NotExpression(i: number): OC_NotExpressionContext | null;
    public oC_NotExpression(i?: number): OC_NotExpressionContext[] | OC_NotExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_NotExpressionContext);
        }

        return this.getRuleContext(i, OC_NotExpressionContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public AND(): antlr.TerminalNode[];
    public AND(i: number): antlr.TerminalNode | null;
    public AND(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.AND);
        } else {
            return this.getToken(CypherParser.AND, i);
        }
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_AndExpression;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_AndExpression) {
             listener.enterOC_AndExpression(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_AndExpression) {
             listener.exitOC_AndExpression(this);
        }
    }
}


export class OC_NotExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_ComparisonExpression(): OC_ComparisonExpressionContext {
        return this.getRuleContext(0, OC_ComparisonExpressionContext)!;
    }
    public NOT(): antlr.TerminalNode[];
    public NOT(i: number): antlr.TerminalNode | null;
    public NOT(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.NOT);
        } else {
            return this.getToken(CypherParser.NOT, i);
        }
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_NotExpression;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_NotExpression) {
             listener.enterOC_NotExpression(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_NotExpression) {
             listener.exitOC_NotExpression(this);
        }
    }
}


export class OC_ComparisonExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_StringListNullPredicateExpression(): OC_StringListNullPredicateExpressionContext {
        return this.getRuleContext(0, OC_StringListNullPredicateExpressionContext)!;
    }
    public oC_PartialComparisonExpression(): OC_PartialComparisonExpressionContext[];
    public oC_PartialComparisonExpression(i: number): OC_PartialComparisonExpressionContext | null;
    public oC_PartialComparisonExpression(i?: number): OC_PartialComparisonExpressionContext[] | OC_PartialComparisonExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_PartialComparisonExpressionContext);
        }

        return this.getRuleContext(i, OC_PartialComparisonExpressionContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_ComparisonExpression;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_ComparisonExpression) {
             listener.enterOC_ComparisonExpression(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_ComparisonExpression) {
             listener.exitOC_ComparisonExpression(this);
        }
    }
}


export class OC_PartialComparisonExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_StringListNullPredicateExpression(): OC_StringListNullPredicateExpressionContext | null {
        return this.getRuleContext(0, OC_StringListNullPredicateExpressionContext);
    }
    public SP(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.SP, 0);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_PartialComparisonExpression;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_PartialComparisonExpression) {
             listener.enterOC_PartialComparisonExpression(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_PartialComparisonExpression) {
             listener.exitOC_PartialComparisonExpression(this);
        }
    }
}


export class OC_StringListNullPredicateExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_AddOrSubtractExpression(): OC_AddOrSubtractExpressionContext {
        return this.getRuleContext(0, OC_AddOrSubtractExpressionContext)!;
    }
    public oC_StringPredicateExpression(): OC_StringPredicateExpressionContext[];
    public oC_StringPredicateExpression(i: number): OC_StringPredicateExpressionContext | null;
    public oC_StringPredicateExpression(i?: number): OC_StringPredicateExpressionContext[] | OC_StringPredicateExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_StringPredicateExpressionContext);
        }

        return this.getRuleContext(i, OC_StringPredicateExpressionContext);
    }
    public oC_ListPredicateExpression(): OC_ListPredicateExpressionContext[];
    public oC_ListPredicateExpression(i: number): OC_ListPredicateExpressionContext | null;
    public oC_ListPredicateExpression(i?: number): OC_ListPredicateExpressionContext[] | OC_ListPredicateExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_ListPredicateExpressionContext);
        }

        return this.getRuleContext(i, OC_ListPredicateExpressionContext);
    }
    public oC_NullPredicateExpression(): OC_NullPredicateExpressionContext[];
    public oC_NullPredicateExpression(i: number): OC_NullPredicateExpressionContext | null;
    public oC_NullPredicateExpression(i?: number): OC_NullPredicateExpressionContext[] | OC_NullPredicateExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_NullPredicateExpressionContext);
        }

        return this.getRuleContext(i, OC_NullPredicateExpressionContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_StringListNullPredicateExpression;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_StringListNullPredicateExpression) {
             listener.enterOC_StringListNullPredicateExpression(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_StringListNullPredicateExpression) {
             listener.exitOC_StringListNullPredicateExpression(this);
        }
    }
}


export class OC_StringPredicateExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_AddOrSubtractExpression(): OC_AddOrSubtractExpressionContext {
        return this.getRuleContext(0, OC_AddOrSubtractExpressionContext)!;
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public STARTS(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.STARTS, 0);
    }
    public WITH(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.WITH, 0);
    }
    public ENDS(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.ENDS, 0);
    }
    public CONTAINS(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.CONTAINS, 0);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_StringPredicateExpression;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_StringPredicateExpression) {
             listener.enterOC_StringPredicateExpression(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_StringPredicateExpression) {
             listener.exitOC_StringPredicateExpression(this);
        }
    }
}


export class OC_ListPredicateExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public IN(): antlr.TerminalNode {
        return this.getToken(CypherParser.IN, 0)!;
    }
    public oC_AddOrSubtractExpression(): OC_AddOrSubtractExpressionContext {
        return this.getRuleContext(0, OC_AddOrSubtractExpressionContext)!;
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_ListPredicateExpression;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_ListPredicateExpression) {
             listener.enterOC_ListPredicateExpression(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_ListPredicateExpression) {
             listener.exitOC_ListPredicateExpression(this);
        }
    }
}


export class OC_NullPredicateExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public IS(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.IS, 0);
    }
    public NULL(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.NULL, 0);
    }
    public NOT(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.NOT, 0);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_NullPredicateExpression;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_NullPredicateExpression) {
             listener.enterOC_NullPredicateExpression(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_NullPredicateExpression) {
             listener.exitOC_NullPredicateExpression(this);
        }
    }
}


export class OC_AddOrSubtractExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_MultiplyDivideModuloExpression(): OC_MultiplyDivideModuloExpressionContext[];
    public oC_MultiplyDivideModuloExpression(i: number): OC_MultiplyDivideModuloExpressionContext | null;
    public oC_MultiplyDivideModuloExpression(i?: number): OC_MultiplyDivideModuloExpressionContext[] | OC_MultiplyDivideModuloExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_MultiplyDivideModuloExpressionContext);
        }

        return this.getRuleContext(i, OC_MultiplyDivideModuloExpressionContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_AddOrSubtractExpression;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_AddOrSubtractExpression) {
             listener.enterOC_AddOrSubtractExpression(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_AddOrSubtractExpression) {
             listener.exitOC_AddOrSubtractExpression(this);
        }
    }
}


export class OC_MultiplyDivideModuloExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_PowerOfExpression(): OC_PowerOfExpressionContext[];
    public oC_PowerOfExpression(i: number): OC_PowerOfExpressionContext | null;
    public oC_PowerOfExpression(i?: number): OC_PowerOfExpressionContext[] | OC_PowerOfExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_PowerOfExpressionContext);
        }

        return this.getRuleContext(i, OC_PowerOfExpressionContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_MultiplyDivideModuloExpression;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_MultiplyDivideModuloExpression) {
             listener.enterOC_MultiplyDivideModuloExpression(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_MultiplyDivideModuloExpression) {
             listener.exitOC_MultiplyDivideModuloExpression(this);
        }
    }
}


export class OC_PowerOfExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_UnaryAddOrSubtractExpression(): OC_UnaryAddOrSubtractExpressionContext[];
    public oC_UnaryAddOrSubtractExpression(i: number): OC_UnaryAddOrSubtractExpressionContext | null;
    public oC_UnaryAddOrSubtractExpression(i?: number): OC_UnaryAddOrSubtractExpressionContext[] | OC_UnaryAddOrSubtractExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_UnaryAddOrSubtractExpressionContext);
        }

        return this.getRuleContext(i, OC_UnaryAddOrSubtractExpressionContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_PowerOfExpression;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_PowerOfExpression) {
             listener.enterOC_PowerOfExpression(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_PowerOfExpression) {
             listener.exitOC_PowerOfExpression(this);
        }
    }
}


export class OC_UnaryAddOrSubtractExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_NonArithmeticOperatorExpression(): OC_NonArithmeticOperatorExpressionContext | null {
        return this.getRuleContext(0, OC_NonArithmeticOperatorExpressionContext);
    }
    public SP(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.SP, 0);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_UnaryAddOrSubtractExpression;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_UnaryAddOrSubtractExpression) {
             listener.enterOC_UnaryAddOrSubtractExpression(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_UnaryAddOrSubtractExpression) {
             listener.exitOC_UnaryAddOrSubtractExpression(this);
        }
    }
}


export class OC_NonArithmeticOperatorExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_Atom(): OC_AtomContext {
        return this.getRuleContext(0, OC_AtomContext)!;
    }
    public oC_NodeLabels(): OC_NodeLabelsContext | null {
        return this.getRuleContext(0, OC_NodeLabelsContext);
    }
    public oC_ListOperatorExpression(): OC_ListOperatorExpressionContext[];
    public oC_ListOperatorExpression(i: number): OC_ListOperatorExpressionContext | null;
    public oC_ListOperatorExpression(i?: number): OC_ListOperatorExpressionContext[] | OC_ListOperatorExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_ListOperatorExpressionContext);
        }

        return this.getRuleContext(i, OC_ListOperatorExpressionContext);
    }
    public oC_PropertyLookup(): OC_PropertyLookupContext[];
    public oC_PropertyLookup(i: number): OC_PropertyLookupContext | null;
    public oC_PropertyLookup(i?: number): OC_PropertyLookupContext[] | OC_PropertyLookupContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_PropertyLookupContext);
        }

        return this.getRuleContext(i, OC_PropertyLookupContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_NonArithmeticOperatorExpression;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_NonArithmeticOperatorExpression) {
             listener.enterOC_NonArithmeticOperatorExpression(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_NonArithmeticOperatorExpression) {
             listener.exitOC_NonArithmeticOperatorExpression(this);
        }
    }
}


export class OC_ListOperatorExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_Expression(): OC_ExpressionContext[];
    public oC_Expression(i: number): OC_ExpressionContext | null;
    public oC_Expression(i?: number): OC_ExpressionContext[] | OC_ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_ExpressionContext);
        }

        return this.getRuleContext(i, OC_ExpressionContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_ListOperatorExpression;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_ListOperatorExpression) {
             listener.enterOC_ListOperatorExpression(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_ListOperatorExpression) {
             listener.exitOC_ListOperatorExpression(this);
        }
    }
}


export class OC_PropertyLookupContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_PropertyKeyName(): OC_PropertyKeyNameContext | null {
        return this.getRuleContext(0, OC_PropertyKeyNameContext);
    }
    public SP(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.SP, 0);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_PropertyLookup;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_PropertyLookup) {
             listener.enterOC_PropertyLookup(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_PropertyLookup) {
             listener.exitOC_PropertyLookup(this);
        }
    }
}


export class OC_AtomContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_Literal(): OC_LiteralContext | null {
        return this.getRuleContext(0, OC_LiteralContext);
    }
    public oC_Parameter(): OC_ParameterContext | null {
        return this.getRuleContext(0, OC_ParameterContext);
    }
    public oC_CaseExpression(): OC_CaseExpressionContext | null {
        return this.getRuleContext(0, OC_CaseExpressionContext);
    }
    public COUNT(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.COUNT, 0);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public oC_ListComprehension(): OC_ListComprehensionContext | null {
        return this.getRuleContext(0, OC_ListComprehensionContext);
    }
    public oC_PatternComprehension(): OC_PatternComprehensionContext | null {
        return this.getRuleContext(0, OC_PatternComprehensionContext);
    }
    public oC_ReduceExpression(): OC_ReduceExpressionContext | null {
        return this.getRuleContext(0, OC_ReduceExpressionContext);
    }
    public oC_ShortestPathPattern(): OC_ShortestPathPatternContext | null {
        return this.getRuleContext(0, OC_ShortestPathPatternContext);
    }
    public oC_Quantifier(): OC_QuantifierContext | null {
        return this.getRuleContext(0, OC_QuantifierContext);
    }
    public oC_PatternPredicate(): OC_PatternPredicateContext | null {
        return this.getRuleContext(0, OC_PatternPredicateContext);
    }
    public oC_ParenthesizedExpression(): OC_ParenthesizedExpressionContext | null {
        return this.getRuleContext(0, OC_ParenthesizedExpressionContext);
    }
    public oC_FunctionInvocation(): OC_FunctionInvocationContext | null {
        return this.getRuleContext(0, OC_FunctionInvocationContext);
    }
    public oC_ExistentialSubquery(): OC_ExistentialSubqueryContext | null {
        return this.getRuleContext(0, OC_ExistentialSubqueryContext);
    }
    public oC_Variable(): OC_VariableContext | null {
        return this.getRuleContext(0, OC_VariableContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_Atom;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_Atom) {
             listener.enterOC_Atom(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_Atom) {
             listener.exitOC_Atom(this);
        }
    }
}


export class OC_CaseExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public END(): antlr.TerminalNode {
        return this.getToken(CypherParser.END, 0)!;
    }
    public ELSE(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.ELSE, 0);
    }
    public oC_Expression(): OC_ExpressionContext[];
    public oC_Expression(i: number): OC_ExpressionContext | null;
    public oC_Expression(i?: number): OC_ExpressionContext[] | OC_ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_ExpressionContext);
        }

        return this.getRuleContext(i, OC_ExpressionContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public CASE(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.CASE, 0);
    }
    public oC_CaseAlternative(): OC_CaseAlternativeContext[];
    public oC_CaseAlternative(i: number): OC_CaseAlternativeContext | null;
    public oC_CaseAlternative(i?: number): OC_CaseAlternativeContext[] | OC_CaseAlternativeContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_CaseAlternativeContext);
        }

        return this.getRuleContext(i, OC_CaseAlternativeContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_CaseExpression;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_CaseExpression) {
             listener.enterOC_CaseExpression(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_CaseExpression) {
             listener.exitOC_CaseExpression(this);
        }
    }
}


export class OC_CaseAlternativeContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public WHEN(): antlr.TerminalNode {
        return this.getToken(CypherParser.WHEN, 0)!;
    }
    public oC_Expression(): OC_ExpressionContext[];
    public oC_Expression(i: number): OC_ExpressionContext | null;
    public oC_Expression(i?: number): OC_ExpressionContext[] | OC_ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_ExpressionContext);
        }

        return this.getRuleContext(i, OC_ExpressionContext);
    }
    public THEN(): antlr.TerminalNode {
        return this.getToken(CypherParser.THEN, 0)!;
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_CaseAlternative;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_CaseAlternative) {
             listener.enterOC_CaseAlternative(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_CaseAlternative) {
             listener.exitOC_CaseAlternative(this);
        }
    }
}


export class OC_ListComprehensionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_FilterExpression(): OC_FilterExpressionContext {
        return this.getRuleContext(0, OC_FilterExpressionContext)!;
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public oC_Expression(): OC_ExpressionContext | null {
        return this.getRuleContext(0, OC_ExpressionContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_ListComprehension;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_ListComprehension) {
             listener.enterOC_ListComprehension(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_ListComprehension) {
             listener.exitOC_ListComprehension(this);
        }
    }
}


export class OC_PatternComprehensionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_RelationshipsPattern(): OC_RelationshipsPatternContext {
        return this.getRuleContext(0, OC_RelationshipsPatternContext)!;
    }
    public oC_Expression(): OC_ExpressionContext {
        return this.getRuleContext(0, OC_ExpressionContext)!;
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public oC_Variable(): OC_VariableContext | null {
        return this.getRuleContext(0, OC_VariableContext);
    }
    public oC_Where(): OC_WhereContext | null {
        return this.getRuleContext(0, OC_WhereContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_PatternComprehension;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_PatternComprehension) {
             listener.enterOC_PatternComprehension(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_PatternComprehension) {
             listener.exitOC_PatternComprehension(this);
        }
    }
}


export class OC_QuantifierContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ALL(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.ALL, 0);
    }
    public oC_FilterExpression(): OC_FilterExpressionContext | null {
        return this.getRuleContext(0, OC_FilterExpressionContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public ANY(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.ANY, 0);
    }
    public NONE(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.NONE, 0);
    }
    public SINGLE(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.SINGLE, 0);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_Quantifier;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_Quantifier) {
             listener.enterOC_Quantifier(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_Quantifier) {
             listener.exitOC_Quantifier(this);
        }
    }
}


export class OC_FilterExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_IdInColl(): OC_IdInCollContext {
        return this.getRuleContext(0, OC_IdInCollContext)!;
    }
    public oC_Where(): OC_WhereContext | null {
        return this.getRuleContext(0, OC_WhereContext);
    }
    public SP(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.SP, 0);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_FilterExpression;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_FilterExpression) {
             listener.enterOC_FilterExpression(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_FilterExpression) {
             listener.exitOC_FilterExpression(this);
        }
    }
}


export class OC_PatternPredicateContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_RelationshipsPattern(): OC_RelationshipsPatternContext {
        return this.getRuleContext(0, OC_RelationshipsPatternContext)!;
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_PatternPredicate;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_PatternPredicate) {
             listener.enterOC_PatternPredicate(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_PatternPredicate) {
             listener.exitOC_PatternPredicate(this);
        }
    }
}


export class OC_ParenthesizedExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_Expression(): OC_ExpressionContext {
        return this.getRuleContext(0, OC_ExpressionContext)!;
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_ParenthesizedExpression;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_ParenthesizedExpression) {
             listener.enterOC_ParenthesizedExpression(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_ParenthesizedExpression) {
             listener.exitOC_ParenthesizedExpression(this);
        }
    }
}


export class OC_IdInCollContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_Variable(): OC_VariableContext {
        return this.getRuleContext(0, OC_VariableContext)!;
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public IN(): antlr.TerminalNode {
        return this.getToken(CypherParser.IN, 0)!;
    }
    public oC_Expression(): OC_ExpressionContext {
        return this.getRuleContext(0, OC_ExpressionContext)!;
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_IdInColl;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_IdInColl) {
             listener.enterOC_IdInColl(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_IdInColl) {
             listener.exitOC_IdInColl(this);
        }
    }
}


export class OC_ReduceExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public REDUCE(): antlr.TerminalNode {
        return this.getToken(CypherParser.REDUCE, 0)!;
    }
    public oC_Variable(): OC_VariableContext {
        return this.getRuleContext(0, OC_VariableContext)!;
    }
    public oC_Expression(): OC_ExpressionContext[];
    public oC_Expression(i: number): OC_ExpressionContext | null;
    public oC_Expression(i?: number): OC_ExpressionContext[] | OC_ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_ExpressionContext);
        }

        return this.getRuleContext(i, OC_ExpressionContext);
    }
    public oC_IdInColl(): OC_IdInCollContext {
        return this.getRuleContext(0, OC_IdInCollContext)!;
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_ReduceExpression;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_ReduceExpression) {
             listener.enterOC_ReduceExpression(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_ReduceExpression) {
             listener.exitOC_ReduceExpression(this);
        }
    }
}


export class OC_FunctionInvocationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_FunctionName(): OC_FunctionNameContext {
        return this.getRuleContext(0, OC_FunctionNameContext)!;
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public DISTINCT(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.DISTINCT, 0);
    }
    public oC_Expression(): OC_ExpressionContext[];
    public oC_Expression(i: number): OC_ExpressionContext | null;
    public oC_Expression(i?: number): OC_ExpressionContext[] | OC_ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_ExpressionContext);
        }

        return this.getRuleContext(i, OC_ExpressionContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_FunctionInvocation;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_FunctionInvocation) {
             listener.enterOC_FunctionInvocation(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_FunctionInvocation) {
             listener.exitOC_FunctionInvocation(this);
        }
    }
}


export class OC_FunctionNameContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_Namespace(): OC_NamespaceContext {
        return this.getRuleContext(0, OC_NamespaceContext)!;
    }
    public oC_SymbolicName(): OC_SymbolicNameContext {
        return this.getRuleContext(0, OC_SymbolicNameContext)!;
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_FunctionName;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_FunctionName) {
             listener.enterOC_FunctionName(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_FunctionName) {
             listener.exitOC_FunctionName(this);
        }
    }
}


export class OC_ExistentialSubqueryContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public EXISTS(): antlr.TerminalNode {
        return this.getToken(CypherParser.EXISTS, 0)!;
    }
    public oC_RegularQuery(): OC_RegularQueryContext | null {
        return this.getRuleContext(0, OC_RegularQueryContext);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public oC_Pattern(): OC_PatternContext | null {
        return this.getRuleContext(0, OC_PatternContext);
    }
    public oC_ReadingClause(): OC_ReadingClauseContext[];
    public oC_ReadingClause(i: number): OC_ReadingClauseContext | null;
    public oC_ReadingClause(i?: number): OC_ReadingClauseContext[] | OC_ReadingClauseContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_ReadingClauseContext);
        }

        return this.getRuleContext(i, OC_ReadingClauseContext);
    }
    public oC_Where(): OC_WhereContext | null {
        return this.getRuleContext(0, OC_WhereContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_ExistentialSubquery;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_ExistentialSubquery) {
             listener.enterOC_ExistentialSubquery(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_ExistentialSubquery) {
             listener.exitOC_ExistentialSubquery(this);
        }
    }
}


export class OC_ExplicitProcedureInvocationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_ProcedureName(): OC_ProcedureNameContext {
        return this.getRuleContext(0, OC_ProcedureNameContext)!;
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public oC_Expression(): OC_ExpressionContext[];
    public oC_Expression(i: number): OC_ExpressionContext | null;
    public oC_Expression(i?: number): OC_ExpressionContext[] | OC_ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_ExpressionContext);
        }

        return this.getRuleContext(i, OC_ExpressionContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_ExplicitProcedureInvocation;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_ExplicitProcedureInvocation) {
             listener.enterOC_ExplicitProcedureInvocation(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_ExplicitProcedureInvocation) {
             listener.exitOC_ExplicitProcedureInvocation(this);
        }
    }
}


export class OC_ImplicitProcedureInvocationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_ProcedureName(): OC_ProcedureNameContext {
        return this.getRuleContext(0, OC_ProcedureNameContext)!;
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_ImplicitProcedureInvocation;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_ImplicitProcedureInvocation) {
             listener.enterOC_ImplicitProcedureInvocation(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_ImplicitProcedureInvocation) {
             listener.exitOC_ImplicitProcedureInvocation(this);
        }
    }
}


export class OC_ProcedureResultFieldContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_SymbolicName(): OC_SymbolicNameContext {
        return this.getRuleContext(0, OC_SymbolicNameContext)!;
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_ProcedureResultField;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_ProcedureResultField) {
             listener.enterOC_ProcedureResultField(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_ProcedureResultField) {
             listener.exitOC_ProcedureResultField(this);
        }
    }
}


export class OC_ProcedureNameContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_Namespace(): OC_NamespaceContext {
        return this.getRuleContext(0, OC_NamespaceContext)!;
    }
    public oC_SymbolicName(): OC_SymbolicNameContext {
        return this.getRuleContext(0, OC_SymbolicNameContext)!;
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_ProcedureName;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_ProcedureName) {
             listener.enterOC_ProcedureName(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_ProcedureName) {
             listener.exitOC_ProcedureName(this);
        }
    }
}


export class OC_NamespaceContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_SymbolicName(): OC_SymbolicNameContext[];
    public oC_SymbolicName(i: number): OC_SymbolicNameContext | null;
    public oC_SymbolicName(i?: number): OC_SymbolicNameContext[] | OC_SymbolicNameContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_SymbolicNameContext);
        }

        return this.getRuleContext(i, OC_SymbolicNameContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_Namespace;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_Namespace) {
             listener.enterOC_Namespace(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_Namespace) {
             listener.exitOC_Namespace(this);
        }
    }
}


export class OC_VariableContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_SymbolicName(): OC_SymbolicNameContext {
        return this.getRuleContext(0, OC_SymbolicNameContext)!;
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_Variable;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_Variable) {
             listener.enterOC_Variable(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_Variable) {
             listener.exitOC_Variable(this);
        }
    }
}


export class OC_LiteralContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_BooleanLiteral(): OC_BooleanLiteralContext | null {
        return this.getRuleContext(0, OC_BooleanLiteralContext);
    }
    public NULL(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.NULL, 0);
    }
    public oC_NumberLiteral(): OC_NumberLiteralContext | null {
        return this.getRuleContext(0, OC_NumberLiteralContext);
    }
    public StringLiteral(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.StringLiteral, 0);
    }
    public oC_ListLiteral(): OC_ListLiteralContext | null {
        return this.getRuleContext(0, OC_ListLiteralContext);
    }
    public oC_MapLiteral(): OC_MapLiteralContext | null {
        return this.getRuleContext(0, OC_MapLiteralContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_Literal;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_Literal) {
             listener.enterOC_Literal(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_Literal) {
             listener.exitOC_Literal(this);
        }
    }
}


export class OC_BooleanLiteralContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public TRUE(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.TRUE, 0);
    }
    public FALSE(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.FALSE, 0);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_BooleanLiteral;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_BooleanLiteral) {
             listener.enterOC_BooleanLiteral(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_BooleanLiteral) {
             listener.exitOC_BooleanLiteral(this);
        }
    }
}


export class OC_NumberLiteralContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_DoubleLiteral(): OC_DoubleLiteralContext | null {
        return this.getRuleContext(0, OC_DoubleLiteralContext);
    }
    public oC_IntegerLiteral(): OC_IntegerLiteralContext | null {
        return this.getRuleContext(0, OC_IntegerLiteralContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_NumberLiteral;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_NumberLiteral) {
             listener.enterOC_NumberLiteral(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_NumberLiteral) {
             listener.exitOC_NumberLiteral(this);
        }
    }
}


export class OC_IntegerLiteralContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public HexInteger(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.HexInteger, 0);
    }
    public OctalInteger(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.OctalInteger, 0);
    }
    public DecimalInteger(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.DecimalInteger, 0);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_IntegerLiteral;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_IntegerLiteral) {
             listener.enterOC_IntegerLiteral(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_IntegerLiteral) {
             listener.exitOC_IntegerLiteral(this);
        }
    }
}


export class OC_DoubleLiteralContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ExponentDecimalReal(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.ExponentDecimalReal, 0);
    }
    public RegularDecimalReal(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.RegularDecimalReal, 0);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_DoubleLiteral;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_DoubleLiteral) {
             listener.enterOC_DoubleLiteral(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_DoubleLiteral) {
             listener.exitOC_DoubleLiteral(this);
        }
    }
}


export class OC_ListLiteralContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public oC_Expression(): OC_ExpressionContext[];
    public oC_Expression(i: number): OC_ExpressionContext | null;
    public oC_Expression(i?: number): OC_ExpressionContext[] | OC_ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_ExpressionContext);
        }

        return this.getRuleContext(i, OC_ExpressionContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_ListLiteral;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_ListLiteral) {
             listener.enterOC_ListLiteral(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_ListLiteral) {
             listener.exitOC_ListLiteral(this);
        }
    }
}


export class OC_MapLiteralContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public oC_PropertyKeyName(): OC_PropertyKeyNameContext[];
    public oC_PropertyKeyName(i: number): OC_PropertyKeyNameContext | null;
    public oC_PropertyKeyName(i?: number): OC_PropertyKeyNameContext[] | OC_PropertyKeyNameContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_PropertyKeyNameContext);
        }

        return this.getRuleContext(i, OC_PropertyKeyNameContext);
    }
    public oC_Expression(): OC_ExpressionContext[];
    public oC_Expression(i: number): OC_ExpressionContext | null;
    public oC_Expression(i?: number): OC_ExpressionContext[] | OC_ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OC_ExpressionContext);
        }

        return this.getRuleContext(i, OC_ExpressionContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_MapLiteral;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_MapLiteral) {
             listener.enterOC_MapLiteral(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_MapLiteral) {
             listener.exitOC_MapLiteral(this);
        }
    }
}


export class OC_PropertyKeyNameContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_SchemaName(): OC_SchemaNameContext {
        return this.getRuleContext(0, OC_SchemaNameContext)!;
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_PropertyKeyName;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_PropertyKeyName) {
             listener.enterOC_PropertyKeyName(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_PropertyKeyName) {
             listener.exitOC_PropertyKeyName(this);
        }
    }
}


export class OC_ParameterContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_SymbolicName(): OC_SymbolicNameContext | null {
        return this.getRuleContext(0, OC_SymbolicNameContext);
    }
    public DecimalInteger(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.DecimalInteger, 0);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_Parameter;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_Parameter) {
             listener.enterOC_Parameter(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_Parameter) {
             listener.exitOC_Parameter(this);
        }
    }
}


export class OC_SchemaNameContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_SymbolicName(): OC_SymbolicNameContext | null {
        return this.getRuleContext(0, OC_SymbolicNameContext);
    }
    public oC_ReservedWord(): OC_ReservedWordContext | null {
        return this.getRuleContext(0, OC_ReservedWordContext);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_SchemaName;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_SchemaName) {
             listener.enterOC_SchemaName(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_SchemaName) {
             listener.exitOC_SchemaName(this);
        }
    }
}


export class OC_ReservedWordContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ALL(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.ALL, 0);
    }
    public ASC(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.ASC, 0);
    }
    public ASCENDING(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.ASCENDING, 0);
    }
    public BY(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.BY, 0);
    }
    public CREATE(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.CREATE, 0);
    }
    public DELETE(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.DELETE, 0);
    }
    public DESC(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.DESC, 0);
    }
    public DESCENDING(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.DESCENDING, 0);
    }
    public DETACH(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.DETACH, 0);
    }
    public EXISTS(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.EXISTS, 0);
    }
    public LIMIT(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.LIMIT, 0);
    }
    public MATCH(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.MATCH, 0);
    }
    public MERGE(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.MERGE, 0);
    }
    public ON(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.ON, 0);
    }
    public OPTIONAL(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.OPTIONAL, 0);
    }
    public ORDER(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.ORDER, 0);
    }
    public REMOVE(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.REMOVE, 0);
    }
    public RETURN(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.RETURN, 0);
    }
    public SET(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.SET, 0);
    }
    public L_SKIP(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.L_SKIP, 0);
    }
    public WHERE(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.WHERE, 0);
    }
    public WITH(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.WITH, 0);
    }
    public UNION(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.UNION, 0);
    }
    public UNWIND(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.UNWIND, 0);
    }
    public FOREACH(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.FOREACH, 0);
    }
    public AND(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.AND, 0);
    }
    public AS(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.AS, 0);
    }
    public CONTAINS(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.CONTAINS, 0);
    }
    public DISTINCT(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.DISTINCT, 0);
    }
    public ENDS(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.ENDS, 0);
    }
    public IN(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.IN, 0);
    }
    public IS(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.IS, 0);
    }
    public NOT(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.NOT, 0);
    }
    public OR(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.OR, 0);
    }
    public STARTS(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.STARTS, 0);
    }
    public XOR(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.XOR, 0);
    }
    public FALSE(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.FALSE, 0);
    }
    public TRUE(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.TRUE, 0);
    }
    public NULL(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.NULL, 0);
    }
    public CONSTRAINT(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.CONSTRAINT, 0);
    }
    public DO(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.DO, 0);
    }
    public FOR(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.FOR, 0);
    }
    public REQUIRE(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.REQUIRE, 0);
    }
    public UNIQUE(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.UNIQUE, 0);
    }
    public CASE(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.CASE, 0);
    }
    public WHEN(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.WHEN, 0);
    }
    public THEN(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.THEN, 0);
    }
    public ELSE(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.ELSE, 0);
    }
    public END(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.END, 0);
    }
    public MANDATORY(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.MANDATORY, 0);
    }
    public SCALAR(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.SCALAR, 0);
    }
    public OF(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.OF, 0);
    }
    public ADD(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.ADD, 0);
    }
    public DROP(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.DROP, 0);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_ReservedWord;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_ReservedWord) {
             listener.enterOC_ReservedWord(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_ReservedWord) {
             listener.exitOC_ReservedWord(this);
        }
    }
}


export class OC_SymbolicNameContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public UnescapedSymbolicName(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.UnescapedSymbolicName, 0);
    }
    public EscapedSymbolicName(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.EscapedSymbolicName, 0);
    }
    public HexLetter(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.HexLetter, 0);
    }
    public COUNT(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.COUNT, 0);
    }
    public FILTER(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.FILTER, 0);
    }
    public EXTRACT(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.EXTRACT, 0);
    }
    public ANY(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.ANY, 0);
    }
    public NONE(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.NONE, 0);
    }
    public SINGLE(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.SINGLE, 0);
    }
    public SHORTESTPATH(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.SHORTESTPATH, 0);
    }
    public ALLSHORTESTPATHS(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.ALLSHORTESTPATHS, 0);
    }
    public REDUCE(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.REDUCE, 0);
    }
    public EXISTS(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.EXISTS, 0);
    }
    public CALL(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.CALL, 0);
    }
    public YIELD(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.YIELD, 0);
    }
    public DROP(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.DROP, 0);
    }
    public REMOVE(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.REMOVE, 0);
    }
    public INDEX(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.INDEX, 0);
    }
    public ASSERT(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.ASSERT, 0);
    }
    public FULLTEXT(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.FULLTEXT, 0);
    }
    public VECTOR(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.VECTOR, 0);
    }
    public OPTIONS(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.OPTIONS, 0);
    }
    public LOAD(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.LOAD, 0);
    }
    public CSV(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.CSV, 0);
    }
    public HEADERS(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.HEADERS, 0);
    }
    public FROM(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.FROM, 0);
    }
    public FIELDTERMINATOR(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.FIELDTERMINATOR, 0);
    }
    public CYPHER(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.CYPHER, 0);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_SymbolicName;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_SymbolicName) {
             listener.enterOC_SymbolicName(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_SymbolicName) {
             listener.exitOC_SymbolicName(this);
        }
    }
}


export class OC_ParameterHeaderContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public oC_SchemaName(): OC_SchemaNameContext {
        return this.getRuleContext(0, OC_SchemaNameContext)!;
    }
    public oC_Expression(): OC_ExpressionContext {
        return this.getRuleContext(0, OC_ExpressionContext)!;
    }
    public SP(): antlr.TerminalNode[];
    public SP(i: number): antlr.TerminalNode | null;
    public SP(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.SP);
        } else {
            return this.getToken(CypherParser.SP, i);
        }
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_ParameterHeader;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_ParameterHeader) {
             listener.enterOC_ParameterHeader(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_ParameterHeader) {
             listener.exitOC_ParameterHeader(this);
        }
    }
}


export class OC_LeftArrowHeadContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_LeftArrowHead;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_LeftArrowHead) {
             listener.enterOC_LeftArrowHead(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_LeftArrowHead) {
             listener.exitOC_LeftArrowHead(this);
        }
    }
}


export class OC_RightArrowHeadContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_RightArrowHead;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_RightArrowHead) {
             listener.enterOC_RightArrowHead(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_RightArrowHead) {
             listener.exitOC_RightArrowHead(this);
        }
    }
}


export class OC_DashContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public override get ruleIndex(): number {
        return CypherParser.RULE_oC_Dash;
    }
    public override enterRule(listener: CypherListener): void {
        if(listener.enterOC_Dash) {
             listener.enterOC_Dash(this);
        }
    }
    public override exitRule(listener: CypherListener): void {
        if(listener.exitOC_Dash) {
             listener.exitOC_Dash(this);
        }
    }
}
