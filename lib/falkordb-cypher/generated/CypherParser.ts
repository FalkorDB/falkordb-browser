// Generated from Cypher.g4 by ANTLR 4.13.1

import * as antlr from "antlr4ng";
import { Token } from "antlr4ng";

import { CypherListener } from "./CypherListener.js";
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
    public static readonly UnescapedSymbolicName = 135;
    public static readonly IdentifierStart = 136;
    public static readonly IdentifierPart = 137;
    public static readonly EscapedSymbolicName = 138;
    public static readonly SP = 139;
    public static readonly WHITESPACE = 140;
    public static readonly Comment = 141;
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
    public static readonly RULE_oC_Order = 41;
    public static readonly RULE_oC_Skip = 42;
    public static readonly RULE_oC_Limit = 43;
    public static readonly RULE_oC_SortItem = 44;
    public static readonly RULE_oC_Where = 45;
    public static readonly RULE_oC_Pattern = 46;
    public static readonly RULE_oC_PatternPart = 47;
    public static readonly RULE_oC_AnonymousPatternPart = 48;
    public static readonly RULE_oC_ShortestPathPattern = 49;
    public static readonly RULE_oC_PatternElement = 50;
    public static readonly RULE_oC_RelationshipsPattern = 51;
    public static readonly RULE_oC_NodePattern = 52;
    public static readonly RULE_oC_PatternElementChain = 53;
    public static readonly RULE_oC_RelationshipPattern = 54;
    public static readonly RULE_oC_RelationshipDetail = 55;
    public static readonly RULE_oC_Properties = 56;
    public static readonly RULE_oC_RelationshipTypes = 57;
    public static readonly RULE_oC_NodeLabels = 58;
    public static readonly RULE_oC_NodeLabel = 59;
    public static readonly RULE_oC_RangeLiteral = 60;
    public static readonly RULE_oC_LabelName = 61;
    public static readonly RULE_oC_RelTypeName = 62;
    public static readonly RULE_oC_PropertyExpression = 63;
    public static readonly RULE_oC_Expression = 64;
    public static readonly RULE_oC_OrExpression = 65;
    public static readonly RULE_oC_XorExpression = 66;
    public static readonly RULE_oC_AndExpression = 67;
    public static readonly RULE_oC_NotExpression = 68;
    public static readonly RULE_oC_ComparisonExpression = 69;
    public static readonly RULE_oC_PartialComparisonExpression = 70;
    public static readonly RULE_oC_StringListNullPredicateExpression = 71;
    public static readonly RULE_oC_StringPredicateExpression = 72;
    public static readonly RULE_oC_ListPredicateExpression = 73;
    public static readonly RULE_oC_NullPredicateExpression = 74;
    public static readonly RULE_oC_AddOrSubtractExpression = 75;
    public static readonly RULE_oC_MultiplyDivideModuloExpression = 76;
    public static readonly RULE_oC_PowerOfExpression = 77;
    public static readonly RULE_oC_UnaryAddOrSubtractExpression = 78;
    public static readonly RULE_oC_NonArithmeticOperatorExpression = 79;
    public static readonly RULE_oC_ListOperatorExpression = 80;
    public static readonly RULE_oC_PropertyLookup = 81;
    public static readonly RULE_oC_Atom = 82;
    public static readonly RULE_oC_CaseExpression = 83;
    public static readonly RULE_oC_CaseAlternative = 84;
    public static readonly RULE_oC_ListComprehension = 85;
    public static readonly RULE_oC_PatternComprehension = 86;
    public static readonly RULE_oC_Quantifier = 87;
    public static readonly RULE_oC_FilterExpression = 88;
    public static readonly RULE_oC_PatternPredicate = 89;
    public static readonly RULE_oC_ParenthesizedExpression = 90;
    public static readonly RULE_oC_IdInColl = 91;
    public static readonly RULE_oC_ReduceExpression = 92;
    public static readonly RULE_oC_FunctionInvocation = 93;
    public static readonly RULE_oC_FunctionName = 94;
    public static readonly RULE_oC_ExistentialSubquery = 95;
    public static readonly RULE_oC_ExplicitProcedureInvocation = 96;
    public static readonly RULE_oC_ImplicitProcedureInvocation = 97;
    public static readonly RULE_oC_ProcedureResultField = 98;
    public static readonly RULE_oC_ProcedureName = 99;
    public static readonly RULE_oC_Namespace = 100;
    public static readonly RULE_oC_Variable = 101;
    public static readonly RULE_oC_Literal = 102;
    public static readonly RULE_oC_BooleanLiteral = 103;
    public static readonly RULE_oC_NumberLiteral = 104;
    public static readonly RULE_oC_IntegerLiteral = 105;
    public static readonly RULE_oC_DoubleLiteral = 106;
    public static readonly RULE_oC_ListLiteral = 107;
    public static readonly RULE_oC_MapLiteral = 108;
    public static readonly RULE_oC_PropertyKeyName = 109;
    public static readonly RULE_oC_Parameter = 110;
    public static readonly RULE_oC_SchemaName = 111;
    public static readonly RULE_oC_ReservedWord = 112;
    public static readonly RULE_oC_SymbolicName = 113;
    public static readonly RULE_oC_LeftArrowHead = 114;
    public static readonly RULE_oC_RightArrowHead = 115;
    public static readonly RULE_oC_Dash = 116;

    public static readonly literalNames = [
        null, "';'", "':'", "'('", "','", "')'", "'|'", "'{'", "'}'", "'='", 
        "'+='", "'*'", "'['", "']'", "'..'", "'<>'", "'<'", "'>'", "'<='", 
        "'>='", "'+'", "'-'", "'/'", "'%'", "'^'", "'.'", "'$'", "'\\u27E8'", 
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
        "DROP", "FILTER", "EXTRACT", "UnescapedSymbolicName", "IdentifierStart", 
        "IdentifierPart", "EscapedSymbolicName", "SP", "WHITESPACE", "Comment"
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
        "oC_ProjectionItems", "oC_ProjectionItem", "oC_Order", "oC_Skip", 
        "oC_Limit", "oC_SortItem", "oC_Where", "oC_Pattern", "oC_PatternPart", 
        "oC_AnonymousPatternPart", "oC_ShortestPathPattern", "oC_PatternElement", 
        "oC_RelationshipsPattern", "oC_NodePattern", "oC_PatternElementChain", 
        "oC_RelationshipPattern", "oC_RelationshipDetail", "oC_Properties", 
        "oC_RelationshipTypes", "oC_NodeLabels", "oC_NodeLabel", "oC_RangeLiteral", 
        "oC_LabelName", "oC_RelTypeName", "oC_PropertyExpression", "oC_Expression", 
        "oC_OrExpression", "oC_XorExpression", "oC_AndExpression", "oC_NotExpression", 
        "oC_ComparisonExpression", "oC_PartialComparisonExpression", "oC_StringListNullPredicateExpression", 
        "oC_StringPredicateExpression", "oC_ListPredicateExpression", "oC_NullPredicateExpression", 
        "oC_AddOrSubtractExpression", "oC_MultiplyDivideModuloExpression", 
        "oC_PowerOfExpression", "oC_UnaryAddOrSubtractExpression", "oC_NonArithmeticOperatorExpression", 
        "oC_ListOperatorExpression", "oC_PropertyLookup", "oC_Atom", "oC_CaseExpression", 
        "oC_CaseAlternative", "oC_ListComprehension", "oC_PatternComprehension", 
        "oC_Quantifier", "oC_FilterExpression", "oC_PatternPredicate", "oC_ParenthesizedExpression", 
        "oC_IdInColl", "oC_ReduceExpression", "oC_FunctionInvocation", "oC_FunctionName", 
        "oC_ExistentialSubquery", "oC_ExplicitProcedureInvocation", "oC_ImplicitProcedureInvocation", 
        "oC_ProcedureResultField", "oC_ProcedureName", "oC_Namespace", "oC_Variable", 
        "oC_Literal", "oC_BooleanLiteral", "oC_NumberLiteral", "oC_IntegerLiteral", 
        "oC_DoubleLiteral", "oC_ListLiteral", "oC_MapLiteral", "oC_PropertyKeyName", 
        "oC_Parameter", "oC_SchemaName", "oC_ReservedWord", "oC_SymbolicName", 
        "oC_LeftArrowHead", "oC_RightArrowHead", "oC_Dash",
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
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 235;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 234;
                this.match(CypherParser.SP);
                }
            }

            this.state = 237;
            this.oC_Statement();
            this.state = 242;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 2, this.context) ) {
            case 1:
                {
                this.state = 239;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 238;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 241;
                this.match(CypherParser.T__0);
                }
                break;
            }
            this.state = 245;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 244;
                this.match(CypherParser.SP);
                }
            }

            this.state = 247;
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
            this.state = 249;
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
            this.state = 254;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 4, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 251;
                this.oC_RegularQuery();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 252;
                this.oC_StandaloneCall();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 253;
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
            this.state = 260;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 5, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 256;
                this.oC_CreateIndex();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 257;
                this.oC_DropIndex();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 258;
                this.oC_CreateConstraint();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 259;
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
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 262;
            this.match(CypherParser.CREATE);
            this.state = 263;
            this.match(CypherParser.SP);
            this.state = 267;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 48 || _la === 49) {
                {
                this.state = 264;
                this.oC_IndexQualifier();
                this.state = 265;
                this.match(CypherParser.SP);
                }
            }

            this.state = 269;
            this.match(CypherParser.INDEX);
            this.state = 271;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 270;
                this.match(CypherParser.SP);
                }
            }

            this.state = 301;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.FOR:
                {
                {
                this.state = 273;
                this.match(CypherParser.FOR);
                this.state = 275;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 274;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 277;
                this.oC_IndexEntity();
                this.state = 279;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 278;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 281;
                this.match(CypherParser.ON);
                this.state = 283;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 282;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 285;
                this.oC_IndexProperties();
                }
                }
                break;
            case CypherParser.ON:
                {
                {
                this.state = 287;
                this.match(CypherParser.ON);
                this.state = 289;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 288;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 291;
                this.match(CypherParser.T__1);
                this.state = 293;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 292;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 295;
                this.oC_LabelName();
                this.state = 297;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 296;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 299;
                this.oC_IndexProperties();
                }
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
            this.state = 311;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 17, this.context) ) {
            case 1:
                {
                this.state = 304;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
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
                if (_la === 139) {
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
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 313;
            this.match(CypherParser.DROP);
            this.state = 314;
            this.match(CypherParser.SP);
            this.state = 318;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 48 || _la === 49) {
                {
                this.state = 315;
                this.oC_IndexQualifier();
                this.state = 316;
                this.match(CypherParser.SP);
                }
            }

            this.state = 320;
            this.match(CypherParser.INDEX);
            this.state = 322;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 321;
                this.match(CypherParser.SP);
                }
            }

            this.state = 352;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.FOR:
                {
                {
                this.state = 324;
                this.match(CypherParser.FOR);
                this.state = 326;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 325;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 328;
                this.oC_IndexEntity();
                this.state = 330;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 329;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 332;
                this.match(CypherParser.ON);
                this.state = 334;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 333;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 336;
                this.oC_IndexProperties();
                }
                }
                break;
            case CypherParser.ON:
                {
                {
                this.state = 338;
                this.match(CypherParser.ON);
                this.state = 340;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 339;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 342;
                this.match(CypherParser.T__1);
                this.state = 344;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 343;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 346;
                this.oC_LabelName();
                this.state = 348;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 347;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 350;
                this.oC_IndexProperties();
                }
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
            this.state = 362;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 29, this.context) ) {
            case 1:
                {
                this.state = 355;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 354;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 357;
                this.match(CypherParser.OPTIONS);
                this.state = 359;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 358;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 361;
                this.oC_MapLiteral();
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
    public oC_IndexQualifier(): OC_IndexQualifierContext {
        let localContext = new OC_IndexQualifierContext(this.context, this.state);
        this.enterRule(localContext, 12, CypherParser.RULE_oC_IndexQualifier);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 364;
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
            this.state = 368;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 30, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 366;
                this.oC_NodePattern();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 367;
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
            this.state = 370;
            this.match(CypherParser.T__2);
            this.state = 372;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 371;
                this.match(CypherParser.SP);
                }
            }

            this.state = 374;
            this.oC_Expression();
            this.state = 385;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 34, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 376;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 375;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 378;
                    this.match(CypherParser.T__3);
                    this.state = 380;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 379;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 382;
                    this.oC_Expression();
                    }
                    }
                }
                this.state = 387;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 34, this.context);
            }
            this.state = 389;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 388;
                this.match(CypherParser.SP);
                }
            }

            this.state = 391;
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
            this.state = 393;
            this.match(CypherParser.CREATE);
            this.state = 394;
            this.match(CypherParser.SP);
            this.state = 395;
            this.match(CypherParser.CONSTRAINT);
            this.state = 396;
            this.match(CypherParser.SP);
            this.state = 397;
            this.match(CypherParser.ON);
            this.state = 399;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 398;
                this.match(CypherParser.SP);
                }
            }

            this.state = 401;
            this.oC_IndexEntity();
            this.state = 402;
            this.match(CypherParser.SP);
            this.state = 403;
            this.match(CypherParser.ASSERT);
            this.state = 404;
            this.match(CypherParser.SP);
            this.state = 405;
            this.oC_Expression();
            this.state = 416;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 39, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 407;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 406;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 409;
                    this.match(CypherParser.T__3);
                    this.state = 411;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 410;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 413;
                    this.oC_Expression();
                    }
                    }
                }
                this.state = 418;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 39, this.context);
            }
            this.state = 421;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 40, this.context) ) {
            case 1:
                {
                this.state = 419;
                this.match(CypherParser.SP);
                this.state = 420;
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
            this.state = 423;
            this.match(CypherParser.DROP);
            this.state = 424;
            this.match(CypherParser.SP);
            this.state = 425;
            this.match(CypherParser.CONSTRAINT);
            this.state = 426;
            this.match(CypherParser.SP);
            this.state = 427;
            this.match(CypherParser.ON);
            this.state = 429;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 428;
                this.match(CypherParser.SP);
                }
            }

            this.state = 431;
            this.oC_IndexEntity();
            this.state = 432;
            this.match(CypherParser.SP);
            this.state = 433;
            this.match(CypherParser.ASSERT);
            this.state = 434;
            this.match(CypherParser.SP);
            this.state = 435;
            this.oC_Expression();
            this.state = 446;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 44, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 437;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 436;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 439;
                    this.match(CypherParser.T__3);
                    this.state = 441;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 440;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 443;
                    this.oC_Expression();
                    }
                    }
                }
                this.state = 448;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 44, this.context);
            }
            this.state = 451;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 45, this.context) ) {
            case 1:
                {
                this.state = 449;
                this.match(CypherParser.SP);
                this.state = 450;
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
            this.state = 461;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 46, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 453;
                this.match(CypherParser.IS);
                this.state = 454;
                this.match(CypherParser.SP);
                this.state = 455;
                this.match(CypherParser.UNIQUE);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 456;
                this.match(CypherParser.IS);
                this.state = 457;
                this.match(CypherParser.SP);
                this.state = 458;
                this.match(CypherParser.NOT);
                this.state = 459;
                this.match(CypherParser.SP);
                this.state = 460;
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
            this.state = 463;
            this.oC_SingleQuery();
            this.state = 470;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 48, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 465;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 464;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 467;
                    this.oC_Union();
                    }
                    }
                }
                this.state = 472;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 48, this.context);
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
            this.state = 485;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 51, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 473;
                this.match(CypherParser.UNION);
                this.state = 474;
                this.match(CypherParser.SP);
                this.state = 475;
                this.match(CypherParser.ALL);
                this.state = 477;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 476;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 479;
                this.oC_SingleQuery();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 480;
                this.match(CypherParser.UNION);
                this.state = 482;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 481;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 484;
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
            this.state = 489;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 52, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 487;
                this.oC_SinglePartQuery();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 488;
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
            this.state = 526;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 61, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 497;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (((((_la - 53)) & ~0x1F) === 0 && ((1 << (_la - 53)) & 131521) !== 0)) {
                    {
                    {
                    this.state = 491;
                    this.oC_ReadingClause();
                    this.state = 493;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 492;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 499;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 500;
                this.oC_Return();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 507;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 56, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 501;
                        this.oC_ReadingClause();
                        this.state = 503;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 502;
                            this.match(CypherParser.SP);
                            }
                        }

                        }
                        }
                    }
                    this.state = 509;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 56, this.context);
                }
                this.state = 510;
                this.oC_UpdatingClause();
                this.state = 517;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 58, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 512;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 511;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 514;
                        this.oC_UpdatingClause();
                        }
                        }
                    }
                    this.state = 519;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 58, this.context);
                }
                this.state = 524;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 60, this.context) ) {
                case 1:
                    {
                    this.state = 521;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 520;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 523;
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
            this.state = 550;
            this.errorHandler.sync(this);
            alternative = 1;
            do {
                switch (alternative) {
                case 1:
                    {
                    {
                    this.state = 534;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 63, this.context);
                    while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                        if (alternative === 1) {
                            {
                            {
                            this.state = 528;
                            this.oC_ReadingClause();
                            this.state = 530;
                            this.errorHandler.sync(this);
                            _la = this.tokenStream.LA(1);
                            if (_la === 139) {
                                {
                                this.state = 529;
                                this.match(CypherParser.SP);
                                }
                            }

                            }
                            }
                        }
                        this.state = 536;
                        this.errorHandler.sync(this);
                        alternative = this.interpreter.adaptivePredict(this.tokenStream, 63, this.context);
                    }
                    this.state = 543;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    while (((((_la - 58)) & ~0x1F) === 0 && ((1 << (_la - 58)) & 8097) !== 0)) {
                        {
                        {
                        this.state = 537;
                        this.oC_UpdatingClause();
                        this.state = 539;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 538;
                            this.match(CypherParser.SP);
                            }
                        }

                        }
                        }
                        this.state = 545;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                    }
                    this.state = 546;
                    this.oC_With();
                    this.state = 548;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 547;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 552;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 67, this.context);
            } while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER);
            this.state = 554;
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
            this.state = 563;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.CREATE:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 556;
                this.oC_Create();
                }
                break;
            case CypherParser.MERGE:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 557;
                this.oC_Merge();
                }
                break;
            case CypherParser.DETACH:
            case CypherParser.DELETE:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 558;
                this.oC_Delete();
                }
                break;
            case CypherParser.SET:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 559;
                this.oC_Set();
                }
                break;
            case CypherParser.REMOVE:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 560;
                this.oC_Remove();
                }
                break;
            case CypherParser.FOREACH:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 561;
                this.oC_Foreach();
                }
                break;
            case CypherParser.CALL:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 562;
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
            this.state = 570;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 69, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 565;
                this.oC_Match();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 566;
                this.oC_Unwind();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 567;
                this.oC_InQueryCall();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 568;
                this.oC_CallSubquery();
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 569;
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
            this.state = 572;
            this.match(CypherParser.LOAD);
            this.state = 573;
            this.match(CypherParser.SP);
            this.state = 574;
            this.match(CypherParser.CSV);
            this.state = 579;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 70, this.context) ) {
            case 1:
                {
                this.state = 575;
                this.match(CypherParser.SP);
                this.state = 576;
                this.match(CypherParser.WITH);
                this.state = 577;
                this.match(CypherParser.SP);
                this.state = 578;
                this.match(CypherParser.HEADERS);
                }
                break;
            }
            this.state = 581;
            this.match(CypherParser.SP);
            this.state = 582;
            this.match(CypherParser.FROM);
            this.state = 583;
            this.match(CypherParser.SP);
            this.state = 584;
            this.oC_Expression();
            this.state = 585;
            this.match(CypherParser.SP);
            this.state = 586;
            this.match(CypherParser.AS);
            this.state = 587;
            this.match(CypherParser.SP);
            this.state = 588;
            this.oC_Variable();
            this.state = 593;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 71, this.context) ) {
            case 1:
                {
                this.state = 589;
                this.match(CypherParser.SP);
                this.state = 590;
                this.match(CypherParser.FIELDTERMINATOR);
                this.state = 591;
                this.match(CypherParser.SP);
                this.state = 592;
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
            this.state = 595;
            this.match(CypherParser.FOREACH);
            this.state = 597;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 596;
                this.match(CypherParser.SP);
                }
            }

            this.state = 599;
            this.match(CypherParser.T__2);
            this.state = 601;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 600;
                this.match(CypherParser.SP);
                }
            }

            this.state = 603;
            this.oC_Variable();
            this.state = 604;
            this.match(CypherParser.SP);
            this.state = 605;
            this.match(CypherParser.IN);
            this.state = 606;
            this.match(CypherParser.SP);
            this.state = 607;
            this.oC_Expression();
            this.state = 609;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 608;
                this.match(CypherParser.SP);
                }
            }

            this.state = 611;
            this.match(CypherParser.T__5);
            this.state = 616;
            this.errorHandler.sync(this);
            alternative = 1;
            do {
                switch (alternative) {
                case 1:
                    {
                    {
                    this.state = 613;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 612;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 615;
                    this.oC_UpdatingClause();
                    }
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 618;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 76, this.context);
            } while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER);
            this.state = 621;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 620;
                this.match(CypherParser.SP);
                }
            }

            this.state = 623;
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
            this.state = 625;
            this.match(CypherParser.CALL);
            this.state = 627;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 626;
                this.match(CypherParser.SP);
                }
            }

            this.state = 629;
            this.match(CypherParser.T__6);
            this.state = 631;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 630;
                this.match(CypherParser.SP);
                }
            }

            this.state = 633;
            this.oC_RegularQuery();
            this.state = 635;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 634;
                this.match(CypherParser.SP);
                }
            }

            this.state = 637;
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
            this.state = 641;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 59) {
                {
                this.state = 639;
                this.match(CypherParser.OPTIONAL);
                this.state = 640;
                this.match(CypherParser.SP);
                }
            }

            this.state = 643;
            this.match(CypherParser.MATCH);
            this.state = 645;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 644;
                this.match(CypherParser.SP);
                }
            }

            this.state = 647;
            this.oC_Pattern();
            this.state = 652;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 84, this.context) ) {
            case 1:
                {
                this.state = 649;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 648;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 651;
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
            this.state = 654;
            this.match(CypherParser.UNWIND);
            this.state = 656;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 655;
                this.match(CypherParser.SP);
                }
            }

            this.state = 658;
            this.oC_Expression();
            this.state = 659;
            this.match(CypherParser.SP);
            this.state = 660;
            this.match(CypherParser.AS);
            this.state = 661;
            this.match(CypherParser.SP);
            this.state = 662;
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
            this.state = 664;
            this.match(CypherParser.MERGE);
            this.state = 666;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 665;
                this.match(CypherParser.SP);
                }
            }

            this.state = 668;
            this.oC_PatternPart();
            this.state = 673;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 87, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 669;
                    this.match(CypherParser.SP);
                    this.state = 670;
                    this.oC_MergeAction();
                    }
                    }
                }
                this.state = 675;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 87, this.context);
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
            this.state = 686;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 88, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 676;
                this.match(CypherParser.ON);
                this.state = 677;
                this.match(CypherParser.SP);
                this.state = 678;
                this.match(CypherParser.MATCH);
                this.state = 679;
                this.match(CypherParser.SP);
                this.state = 680;
                this.oC_Set();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 681;
                this.match(CypherParser.ON);
                this.state = 682;
                this.match(CypherParser.SP);
                this.state = 683;
                this.match(CypherParser.CREATE);
                this.state = 684;
                this.match(CypherParser.SP);
                this.state = 685;
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
            this.state = 688;
            this.match(CypherParser.CREATE);
            this.state = 690;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 689;
                this.match(CypherParser.SP);
                }
            }

            this.state = 692;
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
            this.state = 694;
            this.match(CypherParser.SET);
            this.state = 696;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 695;
                this.match(CypherParser.SP);
                }
            }

            this.state = 698;
            this.oC_SetItem();
            this.state = 709;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 93, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 700;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 699;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 702;
                    this.match(CypherParser.T__3);
                    this.state = 704;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 703;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 706;
                    this.oC_SetItem();
                    }
                    }
                }
                this.state = 711;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 93, this.context);
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
            this.state = 748;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 101, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 712;
                this.oC_PropertyExpression();
                this.state = 714;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 713;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 716;
                this.match(CypherParser.T__8);
                this.state = 718;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 717;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 720;
                this.oC_Expression();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 722;
                this.oC_Variable();
                this.state = 724;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 723;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 726;
                this.match(CypherParser.T__8);
                this.state = 728;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 727;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 730;
                this.oC_Expression();
                }
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                {
                this.state = 732;
                this.oC_Variable();
                this.state = 734;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 733;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 736;
                this.match(CypherParser.T__9);
                this.state = 738;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 737;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 740;
                this.oC_Expression();
                }
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 742;
                this.oC_Variable();
                this.state = 744;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 743;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 746;
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
            this.state = 752;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 67) {
                {
                this.state = 750;
                this.match(CypherParser.DETACH);
                this.state = 751;
                this.match(CypherParser.SP);
                }
            }

            this.state = 754;
            this.match(CypherParser.DELETE);
            this.state = 756;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 755;
                this.match(CypherParser.SP);
                }
            }

            this.state = 758;
            this.oC_Expression();
            this.state = 769;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 106, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 760;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 759;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 762;
                    this.match(CypherParser.T__3);
                    this.state = 764;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 763;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 766;
                    this.oC_Expression();
                    }
                    }
                }
                this.state = 771;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 106, this.context);
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
            this.state = 772;
            this.match(CypherParser.REMOVE);
            this.state = 773;
            this.match(CypherParser.SP);
            this.state = 774;
            this.oC_RemoveItem();
            this.state = 785;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 109, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 776;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 775;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 778;
                    this.match(CypherParser.T__3);
                    this.state = 780;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 779;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 782;
                    this.oC_RemoveItem();
                    }
                    }
                }
                this.state = 787;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 109, this.context);
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
            this.state = 792;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 110, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 788;
                this.oC_Variable();
                this.state = 789;
                this.oC_NodeLabels();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 791;
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
            this.state = 794;
            this.match(CypherParser.CALL);
            this.state = 795;
            this.match(CypherParser.SP);
            this.state = 796;
            this.oC_ExplicitProcedureInvocation();
            this.state = 803;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 112, this.context) ) {
            case 1:
                {
                this.state = 798;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 797;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 800;
                this.match(CypherParser.YIELD);
                this.state = 801;
                this.match(CypherParser.SP);
                this.state = 802;
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
            this.state = 805;
            this.match(CypherParser.CALL);
            this.state = 806;
            this.match(CypherParser.SP);
            this.state = 809;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 113, this.context) ) {
            case 1:
                {
                this.state = 807;
                this.oC_ExplicitProcedureInvocation();
                }
                break;
            case 2:
                {
                this.state = 808;
                this.oC_ImplicitProcedureInvocation();
                }
                break;
            }
            this.state = 820;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 116, this.context) ) {
            case 1:
                {
                this.state = 812;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 811;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 814;
                this.match(CypherParser.YIELD);
                this.state = 815;
                this.match(CypherParser.SP);
                this.state = 818;
                this.errorHandler.sync(this);
                switch (this.tokenStream.LA(1)) {
                case CypherParser.T__10:
                    {
                    this.state = 816;
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
                case CypherParser.SHORTESTPATH:
                case CypherParser.ALLSHORTESTPATHS:
                case CypherParser.COUNT:
                case CypherParser.ANY:
                case CypherParser.NONE:
                case CypherParser.SINGLE:
                case CypherParser.REDUCE:
                case CypherParser.HexLetter:
                case CypherParser.DROP:
                case CypherParser.FILTER:
                case CypherParser.EXTRACT:
                case CypherParser.UnescapedSymbolicName:
                case CypherParser.EscapedSymbolicName:
                    {
                    this.state = 817;
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
            this.state = 822;
            this.oC_YieldItem();
            this.state = 833;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 119, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 824;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 823;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 826;
                    this.match(CypherParser.T__3);
                    this.state = 828;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 827;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 830;
                    this.oC_YieldItem();
                    }
                    }
                }
                this.state = 835;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 119, this.context);
            }
            this.state = 840;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 121, this.context) ) {
            case 1:
                {
                this.state = 837;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 836;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 839;
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
            this.state = 847;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 122, this.context) ) {
            case 1:
                {
                this.state = 842;
                this.oC_ProcedureResultField();
                this.state = 843;
                this.match(CypherParser.SP);
                this.state = 844;
                this.match(CypherParser.AS);
                this.state = 845;
                this.match(CypherParser.SP);
                }
                break;
            }
            this.state = 849;
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
            this.state = 851;
            this.match(CypherParser.WITH);
            this.state = 852;
            this.oC_ProjectionBody();
            this.state = 857;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 124, this.context) ) {
            case 1:
                {
                this.state = 854;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 853;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 856;
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
            this.state = 859;
            this.match(CypherParser.RETURN);
            this.state = 860;
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
            this.state = 866;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 126, this.context) ) {
            case 1:
                {
                this.state = 863;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 862;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 865;
                this.match(CypherParser.DISTINCT);
                }
                break;
            }
            this.state = 868;
            this.match(CypherParser.SP);
            this.state = 869;
            this.oC_ProjectionItems();
            this.state = 872;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 127, this.context) ) {
            case 1:
                {
                this.state = 870;
                this.match(CypherParser.SP);
                this.state = 871;
                this.oC_Order();
                }
                break;
            }
            this.state = 876;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 128, this.context) ) {
            case 1:
                {
                this.state = 874;
                this.match(CypherParser.SP);
                this.state = 875;
                this.oC_Skip();
                }
                break;
            }
            this.state = 880;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 129, this.context) ) {
            case 1:
                {
                this.state = 878;
                this.match(CypherParser.SP);
                this.state = 879;
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
            this.state = 910;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.T__10:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 882;
                this.match(CypherParser.T__10);
                this.state = 893;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 132, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 884;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 883;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 886;
                        this.match(CypherParser.T__3);
                        this.state = 888;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 887;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 890;
                        this.oC_ProjectionItem();
                        }
                        }
                    }
                    this.state = 895;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 132, this.context);
                }
                }
                }
                break;
            case CypherParser.T__2:
            case CypherParser.T__6:
            case CypherParser.T__11:
            case CypherParser.T__19:
            case CypherParser.T__20:
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
            case CypherParser.UnescapedSymbolicName:
            case CypherParser.EscapedSymbolicName:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 896;
                this.oC_ProjectionItem();
                this.state = 907;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 135, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 898;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 897;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 900;
                        this.match(CypherParser.T__3);
                        this.state = 902;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 901;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 904;
                        this.oC_ProjectionItem();
                        }
                        }
                    }
                    this.state = 909;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 135, this.context);
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
        try {
            this.state = 919;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 137, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 912;
                this.oC_Expression();
                this.state = 913;
                this.match(CypherParser.SP);
                this.state = 914;
                this.match(CypherParser.AS);
                this.state = 915;
                this.match(CypherParser.SP);
                this.state = 916;
                this.oC_Variable();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 918;
                this.oC_Expression();
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
        this.enterRule(localContext, 82, CypherParser.RULE_oC_Order);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 921;
            this.match(CypherParser.ORDER);
            this.state = 922;
            this.match(CypherParser.SP);
            this.state = 923;
            this.match(CypherParser.BY);
            this.state = 924;
            this.match(CypherParser.SP);
            this.state = 925;
            this.oC_SortItem();
            this.state = 933;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 4) {
                {
                {
                this.state = 926;
                this.match(CypherParser.T__3);
                this.state = 928;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 927;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 930;
                this.oC_SortItem();
                }
                }
                this.state = 935;
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
        this.enterRule(localContext, 84, CypherParser.RULE_oC_Skip);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 936;
            this.match(CypherParser.L_SKIP);
            this.state = 937;
            this.match(CypherParser.SP);
            this.state = 938;
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
        this.enterRule(localContext, 86, CypherParser.RULE_oC_Limit);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 940;
            this.match(CypherParser.LIMIT);
            this.state = 941;
            this.match(CypherParser.SP);
            this.state = 942;
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
        this.enterRule(localContext, 88, CypherParser.RULE_oC_SortItem);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 944;
            this.oC_Expression();
            this.state = 949;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 141, this.context) ) {
            case 1:
                {
                this.state = 946;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 945;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 948;
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
        this.enterRule(localContext, 90, CypherParser.RULE_oC_Where);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 951;
            this.match(CypherParser.WHERE);
            this.state = 952;
            this.match(CypherParser.SP);
            this.state = 953;
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
        this.enterRule(localContext, 92, CypherParser.RULE_oC_Pattern);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 955;
            this.oC_PatternPart();
            this.state = 966;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 144, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 957;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 956;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 959;
                    this.match(CypherParser.T__3);
                    this.state = 961;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 960;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 963;
                    this.oC_PatternPart();
                    }
                    }
                }
                this.state = 968;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 144, this.context);
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
        this.enterRule(localContext, 94, CypherParser.RULE_oC_PatternPart);
        let _la: number;
        try {
            this.state = 980;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 147, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 969;
                this.oC_Variable();
                this.state = 971;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 970;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 973;
                this.match(CypherParser.T__8);
                this.state = 975;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 974;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 977;
                this.oC_AnonymousPatternPart();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 979;
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
        this.enterRule(localContext, 96, CypherParser.RULE_oC_AnonymousPatternPart);
        try {
            this.state = 984;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.SHORTESTPATH:
            case CypherParser.ALLSHORTESTPATHS:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 982;
                this.oC_ShortestPathPattern();
                }
                break;
            case CypherParser.T__2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 983;
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
        this.enterRule(localContext, 98, CypherParser.RULE_oC_ShortestPathPattern);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 986;
            _la = this.tokenStream.LA(1);
            if(!(_la === 84 || _la === 85)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            this.state = 988;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 987;
                this.match(CypherParser.SP);
                }
            }

            this.state = 990;
            this.match(CypherParser.T__2);
            this.state = 992;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 991;
                this.match(CypherParser.SP);
                }
            }

            this.state = 994;
            this.oC_PatternElement();
            this.state = 996;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 995;
                this.match(CypherParser.SP);
                }
            }

            this.state = 998;
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
        this.enterRule(localContext, 100, CypherParser.RULE_oC_PatternElement);
        let _la: number;
        try {
            let alternative: number;
            this.state = 1014;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 154, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1000;
                this.oC_NodePattern();
                this.state = 1007;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 153, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 1002;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1001;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1004;
                        this.oC_PatternElementChain();
                        }
                        }
                    }
                    this.state = 1009;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 153, this.context);
                }
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1010;
                this.match(CypherParser.T__2);
                this.state = 1011;
                this.oC_PatternElement();
                this.state = 1012;
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
        this.enterRule(localContext, 102, CypherParser.RULE_oC_RelationshipsPattern);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1016;
            this.oC_NodePattern();
            this.state = 1021;
            this.errorHandler.sync(this);
            alternative = 1;
            do {
                switch (alternative) {
                case 1:
                    {
                    {
                    this.state = 1018;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1017;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1020;
                    this.oC_PatternElementChain();
                    }
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 1023;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 156, this.context);
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
        this.enterRule(localContext, 104, CypherParser.RULE_oC_NodePattern);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1025;
            this.match(CypherParser.T__2);
            this.state = 1027;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1026;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1033;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 8392607) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 272371715) !== 0) || ((((_la - 132)) & ~0x1F) === 0 && ((1 << (_la - 132)) & 79) !== 0)) {
                {
                this.state = 1029;
                this.oC_Variable();
                this.state = 1031;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1030;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1039;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 2) {
                {
                this.state = 1035;
                this.oC_NodeLabels();
                this.state = 1037;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1036;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1045;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 7 || _la === 26) {
                {
                this.state = 1041;
                this.oC_Properties();
                this.state = 1043;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1042;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1047;
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
        this.enterRule(localContext, 106, CypherParser.RULE_oC_PatternElementChain);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1049;
            this.oC_RelationshipPattern();
            this.state = 1051;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1050;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1053;
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
        this.enterRule(localContext, 108, CypherParser.RULE_oC_RelationshipPattern);
        let _la: number;
        try {
            this.state = 1119;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 181, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1055;
                this.oC_LeftArrowHead();
                this.state = 1057;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1056;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1059;
                this.oC_Dash();
                this.state = 1061;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 166, this.context) ) {
                case 1:
                    {
                    this.state = 1060;
                    this.match(CypherParser.SP);
                    }
                    break;
                }
                this.state = 1064;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 12) {
                    {
                    this.state = 1063;
                    this.oC_RelationshipDetail();
                    }
                }

                this.state = 1067;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1066;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1069;
                this.oC_Dash();
                this.state = 1071;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1070;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1073;
                this.oC_RightArrowHead();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1075;
                this.oC_LeftArrowHead();
                this.state = 1077;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1076;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1079;
                this.oC_Dash();
                this.state = 1081;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 171, this.context) ) {
                case 1:
                    {
                    this.state = 1080;
                    this.match(CypherParser.SP);
                    }
                    break;
                }
                this.state = 1084;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 12) {
                    {
                    this.state = 1083;
                    this.oC_RelationshipDetail();
                    }
                }

                this.state = 1087;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1086;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1089;
                this.oC_Dash();
                }
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                {
                this.state = 1091;
                this.oC_Dash();
                this.state = 1093;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 174, this.context) ) {
                case 1:
                    {
                    this.state = 1092;
                    this.match(CypherParser.SP);
                    }
                    break;
                }
                this.state = 1096;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 12) {
                    {
                    this.state = 1095;
                    this.oC_RelationshipDetail();
                    }
                }

                this.state = 1099;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1098;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1101;
                this.oC_Dash();
                this.state = 1103;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1102;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1105;
                this.oC_RightArrowHead();
                }
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 1107;
                this.oC_Dash();
                this.state = 1109;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 178, this.context) ) {
                case 1:
                    {
                    this.state = 1108;
                    this.match(CypherParser.SP);
                    }
                    break;
                }
                this.state = 1112;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 12) {
                    {
                    this.state = 1111;
                    this.oC_RelationshipDetail();
                    }
                }

                this.state = 1115;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1114;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1117;
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
        this.enterRule(localContext, 110, CypherParser.RULE_oC_RelationshipDetail);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1121;
            this.match(CypherParser.T__11);
            this.state = 1123;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1122;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1129;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 8392607) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 272371715) !== 0) || ((((_la - 132)) & ~0x1F) === 0 && ((1 << (_la - 132)) & 79) !== 0)) {
                {
                this.state = 1125;
                this.oC_Variable();
                this.state = 1127;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1126;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1135;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 2) {
                {
                this.state = 1131;
                this.oC_RelationshipTypes();
                this.state = 1133;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1132;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1138;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 11) {
                {
                this.state = 1137;
                this.oC_RangeLiteral();
                }
            }

            this.state = 1144;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 7 || _la === 26) {
                {
                this.state = 1140;
                this.oC_Properties();
                this.state = 1142;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1141;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1146;
            this.match(CypherParser.T__12);
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
        this.enterRule(localContext, 112, CypherParser.RULE_oC_Properties);
        try {
            this.state = 1150;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.T__6:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1148;
                this.oC_MapLiteral();
                }
                break;
            case CypherParser.T__25:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1149;
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
        this.enterRule(localContext, 114, CypherParser.RULE_oC_RelationshipTypes);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1152;
            this.match(CypherParser.T__1);
            this.state = 1154;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1153;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1156;
            this.oC_RelTypeName();
            this.state = 1170;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 195, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1158;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1157;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1160;
                    this.match(CypherParser.T__5);
                    this.state = 1162;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 2) {
                        {
                        this.state = 1161;
                        this.match(CypherParser.T__1);
                        }
                    }

                    this.state = 1165;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1164;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1167;
                    this.oC_RelTypeName();
                    }
                    }
                }
                this.state = 1172;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 195, this.context);
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
        this.enterRule(localContext, 116, CypherParser.RULE_oC_NodeLabels);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1173;
            this.oC_NodeLabel();
            this.state = 1180;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 197, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1175;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1174;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1177;
                    this.oC_NodeLabel();
                    }
                    }
                }
                this.state = 1182;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 197, this.context);
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
        this.enterRule(localContext, 118, CypherParser.RULE_oC_NodeLabel);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1183;
            this.match(CypherParser.T__1);
            this.state = 1185;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1184;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1187;
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
        this.enterRule(localContext, 120, CypherParser.RULE_oC_RangeLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1189;
            this.match(CypherParser.T__10);
            this.state = 1191;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1190;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1197;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 109)) & ~0x1F) === 0 && ((1 << (_la - 109)) & 7) !== 0)) {
                {
                this.state = 1193;
                this.oC_IntegerLiteral();
                this.state = 1195;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1194;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1209;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 14) {
                {
                this.state = 1199;
                this.match(CypherParser.T__13);
                this.state = 1201;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1200;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1207;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (((((_la - 109)) & ~0x1F) === 0 && ((1 << (_la - 109)) & 7) !== 0)) {
                    {
                    this.state = 1203;
                    this.oC_IntegerLiteral();
                    this.state = 1205;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1204;
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
        this.enterRule(localContext, 122, CypherParser.RULE_oC_LabelName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1211;
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
        this.enterRule(localContext, 124, CypherParser.RULE_oC_RelTypeName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1213;
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
        this.enterRule(localContext, 126, CypherParser.RULE_oC_PropertyExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1215;
            this.oC_Atom();
            this.state = 1220;
            this.errorHandler.sync(this);
            alternative = 1;
            do {
                switch (alternative) {
                case 1:
                    {
                    {
                    this.state = 1217;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1216;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1219;
                    this.oC_PropertyLookup();
                    }
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 1222;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 207, this.context);
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
        this.enterRule(localContext, 128, CypherParser.RULE_oC_Expression);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1224;
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
        this.enterRule(localContext, 130, CypherParser.RULE_oC_OrExpression);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1226;
            this.oC_XorExpression();
            this.state = 1233;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 208, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1227;
                    this.match(CypherParser.SP);
                    this.state = 1228;
                    this.match(CypherParser.OR);
                    this.state = 1229;
                    this.match(CypherParser.SP);
                    this.state = 1230;
                    this.oC_XorExpression();
                    }
                    }
                }
                this.state = 1235;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 208, this.context);
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
        this.enterRule(localContext, 132, CypherParser.RULE_oC_XorExpression);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1236;
            this.oC_AndExpression();
            this.state = 1243;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 209, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1237;
                    this.match(CypherParser.SP);
                    this.state = 1238;
                    this.match(CypherParser.XOR);
                    this.state = 1239;
                    this.match(CypherParser.SP);
                    this.state = 1240;
                    this.oC_AndExpression();
                    }
                    }
                }
                this.state = 1245;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 209, this.context);
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
        this.enterRule(localContext, 134, CypherParser.RULE_oC_AndExpression);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1246;
            this.oC_NotExpression();
            this.state = 1253;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 210, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1247;
                    this.match(CypherParser.SP);
                    this.state = 1248;
                    this.match(CypherParser.AND);
                    this.state = 1249;
                    this.match(CypherParser.SP);
                    this.state = 1250;
                    this.oC_NotExpression();
                    }
                    }
                }
                this.state = 1255;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 210, this.context);
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
        this.enterRule(localContext, 136, CypherParser.RULE_oC_NotExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1262;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 89) {
                {
                {
                this.state = 1256;
                this.match(CypherParser.NOT);
                this.state = 1258;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1257;
                    this.match(CypherParser.SP);
                    }
                }

                }
                }
                this.state = 1264;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 1265;
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
        this.enterRule(localContext, 138, CypherParser.RULE_oC_ComparisonExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1267;
            this.oC_StringListNullPredicateExpression();
            this.state = 1274;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 214, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1269;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1268;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1271;
                    this.oC_PartialComparisonExpression();
                    }
                    }
                }
                this.state = 1276;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 214, this.context);
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
        this.enterRule(localContext, 140, CypherParser.RULE_oC_PartialComparisonExpression);
        let _la: number;
        try {
            this.state = 1307;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.T__8:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1277;
                this.match(CypherParser.T__8);
                this.state = 1279;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1278;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1281;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__14:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1282;
                this.match(CypherParser.T__14);
                this.state = 1284;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1283;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1286;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__15:
                this.enterOuterAlt(localContext, 3);
                {
                {
                this.state = 1287;
                this.match(CypherParser.T__15);
                this.state = 1289;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1288;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1291;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__16:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 1292;
                this.match(CypherParser.T__16);
                this.state = 1294;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1293;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1296;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__17:
                this.enterOuterAlt(localContext, 5);
                {
                {
                this.state = 1297;
                this.match(CypherParser.T__17);
                this.state = 1299;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1298;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1301;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__18:
                this.enterOuterAlt(localContext, 6);
                {
                {
                this.state = 1302;
                this.match(CypherParser.T__18);
                this.state = 1304;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1303;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1306;
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
        this.enterRule(localContext, 142, CypherParser.RULE_oC_StringListNullPredicateExpression);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1309;
            this.oC_AddOrSubtractExpression();
            this.state = 1315;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 223, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    this.state = 1313;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 222, this.context) ) {
                    case 1:
                        {
                        this.state = 1310;
                        this.oC_StringPredicateExpression();
                        }
                        break;
                    case 2:
                        {
                        this.state = 1311;
                        this.oC_ListPredicateExpression();
                        }
                        break;
                    case 3:
                        {
                        this.state = 1312;
                        this.oC_NullPredicateExpression();
                        }
                        break;
                    }
                    }
                }
                this.state = 1317;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 223, this.context);
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
        this.enterRule(localContext, 144, CypherParser.RULE_oC_StringPredicateExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1328;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 224, this.context) ) {
            case 1:
                {
                {
                this.state = 1318;
                this.match(CypherParser.SP);
                this.state = 1319;
                this.match(CypherParser.STARTS);
                this.state = 1320;
                this.match(CypherParser.SP);
                this.state = 1321;
                this.match(CypherParser.WITH);
                }
                }
                break;
            case 2:
                {
                {
                this.state = 1322;
                this.match(CypherParser.SP);
                this.state = 1323;
                this.match(CypherParser.ENDS);
                this.state = 1324;
                this.match(CypherParser.SP);
                this.state = 1325;
                this.match(CypherParser.WITH);
                }
                }
                break;
            case 3:
                {
                {
                this.state = 1326;
                this.match(CypherParser.SP);
                this.state = 1327;
                this.match(CypherParser.CONTAINS);
                }
                }
                break;
            }
            this.state = 1331;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1330;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1333;
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
        this.enterRule(localContext, 146, CypherParser.RULE_oC_ListPredicateExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1335;
            this.match(CypherParser.SP);
            this.state = 1336;
            this.match(CypherParser.IN);
            this.state = 1338;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1337;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1340;
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
        this.enterRule(localContext, 148, CypherParser.RULE_oC_NullPredicateExpression);
        try {
            this.state = 1352;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 227, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1342;
                this.match(CypherParser.SP);
                this.state = 1343;
                this.match(CypherParser.IS);
                this.state = 1344;
                this.match(CypherParser.SP);
                this.state = 1345;
                this.match(CypherParser.NULL);
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1346;
                this.match(CypherParser.SP);
                this.state = 1347;
                this.match(CypherParser.IS);
                this.state = 1348;
                this.match(CypherParser.SP);
                this.state = 1349;
                this.match(CypherParser.NOT);
                this.state = 1350;
                this.match(CypherParser.SP);
                this.state = 1351;
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
        this.enterRule(localContext, 150, CypherParser.RULE_oC_AddOrSubtractExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1354;
            this.oC_MultiplyDivideModuloExpression();
            this.state = 1373;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 233, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    this.state = 1371;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 232, this.context) ) {
                    case 1:
                        {
                        {
                        this.state = 1356;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1355;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1358;
                        this.match(CypherParser.T__19);
                        this.state = 1360;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1359;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1362;
                        this.oC_MultiplyDivideModuloExpression();
                        }
                        }
                        break;
                    case 2:
                        {
                        {
                        this.state = 1364;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1363;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1366;
                        this.match(CypherParser.T__20);
                        this.state = 1368;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1367;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1370;
                        this.oC_MultiplyDivideModuloExpression();
                        }
                        }
                        break;
                    }
                    }
                }
                this.state = 1375;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 233, this.context);
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
        this.enterRule(localContext, 152, CypherParser.RULE_oC_MultiplyDivideModuloExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1376;
            this.oC_PowerOfExpression();
            this.state = 1403;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 241, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    this.state = 1401;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 240, this.context) ) {
                    case 1:
                        {
                        {
                        this.state = 1378;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1377;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1380;
                        this.match(CypherParser.T__10);
                        this.state = 1382;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1381;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1384;
                        this.oC_PowerOfExpression();
                        }
                        }
                        break;
                    case 2:
                        {
                        {
                        this.state = 1386;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1385;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1388;
                        this.match(CypherParser.T__21);
                        this.state = 1390;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1389;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1392;
                        this.oC_PowerOfExpression();
                        }
                        }
                        break;
                    case 3:
                        {
                        {
                        this.state = 1394;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1393;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1396;
                        this.match(CypherParser.T__22);
                        this.state = 1398;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1397;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1400;
                        this.oC_PowerOfExpression();
                        }
                        }
                        break;
                    }
                    }
                }
                this.state = 1405;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 241, this.context);
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
        this.enterRule(localContext, 154, CypherParser.RULE_oC_PowerOfExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1406;
            this.oC_UnaryAddOrSubtractExpression();
            this.state = 1417;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 244, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1408;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1407;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1410;
                    this.match(CypherParser.T__23);
                    this.state = 1412;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1411;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1414;
                    this.oC_UnaryAddOrSubtractExpression();
                    }
                    }
                }
                this.state = 1419;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 244, this.context);
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
        this.enterRule(localContext, 156, CypherParser.RULE_oC_UnaryAddOrSubtractExpression);
        let _la: number;
        try {
            this.state = 1426;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.T__2:
            case CypherParser.T__6:
            case CypherParser.T__11:
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
            case CypherParser.UnescapedSymbolicName:
            case CypherParser.EscapedSymbolicName:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1420;
                this.oC_NonArithmeticOperatorExpression();
                }
                break;
            case CypherParser.T__19:
            case CypherParser.T__20:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1421;
                _la = this.tokenStream.LA(1);
                if(!(_la === 20 || _la === 21)) {
                this.errorHandler.recoverInline(this);
                }
                else {
                    this.errorHandler.reportMatch(this);
                    this.consume();
                }
                this.state = 1423;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1422;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1425;
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
        this.enterRule(localContext, 158, CypherParser.RULE_oC_NonArithmeticOperatorExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1428;
            this.oC_Atom();
            this.state = 1439;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 250, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    this.state = 1437;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 249, this.context) ) {
                    case 1:
                        {
                        {
                        this.state = 1430;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1429;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1432;
                        this.oC_ListOperatorExpression();
                        }
                        }
                        break;
                    case 2:
                        {
                        {
                        this.state = 1434;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1433;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1436;
                        this.oC_PropertyLookup();
                        }
                        }
                        break;
                    }
                    }
                }
                this.state = 1441;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 250, this.context);
            }
            this.state = 1446;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 252, this.context) ) {
            case 1:
                {
                this.state = 1443;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1442;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1445;
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
        this.enterRule(localContext, 160, CypherParser.RULE_oC_ListOperatorExpression);
        let _la: number;
        try {
            this.state = 1461;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 255, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1448;
                this.match(CypherParser.T__11);
                this.state = 1449;
                this.oC_Expression();
                this.state = 1450;
                this.match(CypherParser.T__12);
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1452;
                this.match(CypherParser.T__11);
                this.state = 1454;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 70258824) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 8392671) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 536623139) !== 0) || ((((_la - 119)) & ~0x1F) === 0 && ((1 << (_la - 119)) & 647175) !== 0)) {
                    {
                    this.state = 1453;
                    this.oC_Expression();
                    }
                }

                this.state = 1456;
                this.match(CypherParser.T__13);
                this.state = 1458;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 70258824) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 8392671) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 536623139) !== 0) || ((((_la - 119)) & ~0x1F) === 0 && ((1 << (_la - 119)) & 647175) !== 0)) {
                    {
                    this.state = 1457;
                    this.oC_Expression();
                    }
                }

                this.state = 1460;
                this.match(CypherParser.T__12);
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
        this.enterRule(localContext, 162, CypherParser.RULE_oC_PropertyLookup);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1463;
            this.match(CypherParser.T__24);
            this.state = 1465;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1464;
                this.match(CypherParser.SP);
                }
            }

            {
            this.state = 1467;
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
        this.enterRule(localContext, 164, CypherParser.RULE_oC_Atom);
        let _la: number;
        try {
            this.state = 1495;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 260, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1469;
                this.oC_Literal();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1470;
                this.oC_Parameter();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1471;
                this.oC_CaseExpression();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 1472;
                this.match(CypherParser.COUNT);
                this.state = 1474;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1473;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1476;
                this.match(CypherParser.T__2);
                this.state = 1478;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1477;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1480;
                this.match(CypherParser.T__10);
                this.state = 1482;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1481;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1484;
                this.match(CypherParser.T__4);
                }
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 1485;
                this.oC_ListComprehension();
                }
                break;
            case 6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 1486;
                this.oC_PatternComprehension();
                }
                break;
            case 7:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 1487;
                this.oC_ReduceExpression();
                }
                break;
            case 8:
                this.enterOuterAlt(localContext, 8);
                {
                this.state = 1488;
                this.oC_ShortestPathPattern();
                }
                break;
            case 9:
                this.enterOuterAlt(localContext, 9);
                {
                this.state = 1489;
                this.oC_Quantifier();
                }
                break;
            case 10:
                this.enterOuterAlt(localContext, 10);
                {
                this.state = 1490;
                this.oC_PatternPredicate();
                }
                break;
            case 11:
                this.enterOuterAlt(localContext, 11);
                {
                this.state = 1491;
                this.oC_ParenthesizedExpression();
                }
                break;
            case 12:
                this.enterOuterAlt(localContext, 12);
                {
                this.state = 1492;
                this.oC_FunctionInvocation();
                }
                break;
            case 13:
                this.enterOuterAlt(localContext, 13);
                {
                this.state = 1493;
                this.oC_ExistentialSubquery();
                }
                break;
            case 14:
                this.enterOuterAlt(localContext, 14);
                {
                this.state = 1494;
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
        this.enterRule(localContext, 166, CypherParser.RULE_oC_CaseExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1519;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 266, this.context) ) {
            case 1:
                {
                {
                this.state = 1497;
                this.match(CypherParser.CASE);
                this.state = 1502;
                this.errorHandler.sync(this);
                alternative = 1;
                do {
                    switch (alternative) {
                    case 1:
                        {
                        {
                        this.state = 1499;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1498;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1501;
                        this.oC_CaseAlternative();
                        }
                        }
                        break;
                    default:
                        throw new antlr.NoViableAltException(this);
                    }
                    this.state = 1504;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 262, this.context);
                } while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER);
                }
                }
                break;
            case 2:
                {
                {
                this.state = 1506;
                this.match(CypherParser.CASE);
                this.state = 1508;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1507;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1510;
                this.oC_Expression();
                this.state = 1515;
                this.errorHandler.sync(this);
                alternative = 1;
                do {
                    switch (alternative) {
                    case 1:
                        {
                        {
                        this.state = 1512;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1511;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1514;
                        this.oC_CaseAlternative();
                        }
                        }
                        break;
                    default:
                        throw new antlr.NoViableAltException(this);
                    }
                    this.state = 1517;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 265, this.context);
                } while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER);
                }
                }
                break;
            }
            this.state = 1529;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 269, this.context) ) {
            case 1:
                {
                this.state = 1522;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1521;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1524;
                this.match(CypherParser.ELSE);
                this.state = 1526;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1525;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1528;
                this.oC_Expression();
                }
                break;
            }
            this.state = 1532;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1531;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1534;
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
        this.enterRule(localContext, 168, CypherParser.RULE_oC_CaseAlternative);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1536;
            this.match(CypherParser.WHEN);
            this.state = 1538;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1537;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1540;
            this.oC_Expression();
            this.state = 1542;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1541;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1544;
            this.match(CypherParser.THEN);
            this.state = 1546;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1545;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1548;
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
        this.enterRule(localContext, 170, CypherParser.RULE_oC_ListComprehension);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1550;
            this.match(CypherParser.T__11);
            this.state = 1552;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1551;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1554;
            this.oC_FilterExpression();
            this.state = 1563;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 277, this.context) ) {
            case 1:
                {
                this.state = 1556;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1555;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1558;
                this.match(CypherParser.T__5);
                this.state = 1560;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1559;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1562;
                this.oC_Expression();
                }
                break;
            }
            this.state = 1566;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1565;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1568;
            this.match(CypherParser.T__12);
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
        this.enterRule(localContext, 172, CypherParser.RULE_oC_PatternComprehension);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1570;
            this.match(CypherParser.T__11);
            this.state = 1572;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1571;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1582;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 8392607) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 272371715) !== 0) || ((((_la - 132)) & ~0x1F) === 0 && ((1 << (_la - 132)) & 79) !== 0)) {
                {
                this.state = 1574;
                this.oC_Variable();
                this.state = 1576;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1575;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1578;
                this.match(CypherParser.T__8);
                this.state = 1580;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1579;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1584;
            this.oC_RelationshipsPattern();
            this.state = 1586;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1585;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1592;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 83) {
                {
                this.state = 1588;
                this.oC_Where();
                this.state = 1590;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1589;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1594;
            this.match(CypherParser.T__5);
            this.state = 1596;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1595;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1598;
            this.oC_Expression();
            this.state = 1600;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1599;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1602;
            this.match(CypherParser.T__12);
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
        this.enterRule(localContext, 174, CypherParser.RULE_oC_Quantifier);
        let _la: number;
        try {
            this.state = 1660;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.ALL:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1604;
                this.match(CypherParser.ALL);
                this.state = 1606;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1605;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1608;
                this.match(CypherParser.T__2);
                this.state = 1610;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1609;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1612;
                this.oC_FilterExpression();
                this.state = 1614;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1613;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1616;
                this.match(CypherParser.T__4);
                }
                }
                break;
            case CypherParser.ANY:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1618;
                this.match(CypherParser.ANY);
                this.state = 1620;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1619;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1622;
                this.match(CypherParser.T__2);
                this.state = 1624;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1623;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1626;
                this.oC_FilterExpression();
                this.state = 1628;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1627;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1630;
                this.match(CypherParser.T__4);
                }
                }
                break;
            case CypherParser.NONE:
                this.enterOuterAlt(localContext, 3);
                {
                {
                this.state = 1632;
                this.match(CypherParser.NONE);
                this.state = 1634;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1633;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1636;
                this.match(CypherParser.T__2);
                this.state = 1638;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1637;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1640;
                this.oC_FilterExpression();
                this.state = 1642;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1641;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1644;
                this.match(CypherParser.T__4);
                }
                }
                break;
            case CypherParser.SINGLE:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 1646;
                this.match(CypherParser.SINGLE);
                this.state = 1648;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1647;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1650;
                this.match(CypherParser.T__2);
                this.state = 1652;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1651;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1654;
                this.oC_FilterExpression();
                this.state = 1656;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1655;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1658;
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
        this.enterRule(localContext, 176, CypherParser.RULE_oC_FilterExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1662;
            this.oC_IdInColl();
            this.state = 1667;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 302, this.context) ) {
            case 1:
                {
                this.state = 1664;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1663;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1666;
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
        this.enterRule(localContext, 178, CypherParser.RULE_oC_PatternPredicate);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1669;
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
        this.enterRule(localContext, 180, CypherParser.RULE_oC_ParenthesizedExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1671;
            this.match(CypherParser.T__2);
            this.state = 1673;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1672;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1675;
            this.oC_Expression();
            this.state = 1677;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1676;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1679;
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
        this.enterRule(localContext, 182, CypherParser.RULE_oC_IdInColl);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1681;
            this.oC_Variable();
            this.state = 1682;
            this.match(CypherParser.SP);
            this.state = 1683;
            this.match(CypherParser.IN);
            this.state = 1684;
            this.match(CypherParser.SP);
            this.state = 1685;
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
        this.enterRule(localContext, 184, CypherParser.RULE_oC_ReduceExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1687;
            this.match(CypherParser.REDUCE);
            this.state = 1689;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1688;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1691;
            this.match(CypherParser.T__2);
            this.state = 1693;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1692;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1695;
            this.oC_Variable();
            this.state = 1697;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1696;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1699;
            this.match(CypherParser.T__8);
            this.state = 1701;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1700;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1703;
            this.oC_Expression();
            this.state = 1705;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1704;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1707;
            this.match(CypherParser.T__3);
            this.state = 1709;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1708;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1711;
            this.oC_IdInColl();
            this.state = 1713;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1712;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1715;
            this.match(CypherParser.T__5);
            this.state = 1717;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1716;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1719;
            this.oC_Expression();
            this.state = 1721;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1720;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1723;
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
        this.enterRule(localContext, 186, CypherParser.RULE_oC_FunctionInvocation);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1725;
            this.oC_FunctionName();
            this.state = 1727;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1726;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1729;
            this.match(CypherParser.T__2);
            this.state = 1731;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1730;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1737;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 74) {
                {
                this.state = 1733;
                this.match(CypherParser.DISTINCT);
                this.state = 1735;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1734;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1756;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 70258824) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 8392671) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 536623139) !== 0) || ((((_la - 119)) & ~0x1F) === 0 && ((1 << (_la - 119)) & 647175) !== 0)) {
                {
                this.state = 1739;
                this.oC_Expression();
                this.state = 1741;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1740;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1753;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 4) {
                    {
                    {
                    this.state = 1743;
                    this.match(CypherParser.T__3);
                    this.state = 1745;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1744;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1747;
                    this.oC_Expression();
                    this.state = 1749;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1748;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 1755;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            this.state = 1758;
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
        this.enterRule(localContext, 188, CypherParser.RULE_oC_FunctionName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1760;
            this.oC_Namespace();
            this.state = 1761;
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
        this.enterRule(localContext, 190, CypherParser.RULE_oC_ExistentialSubquery);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1763;
            this.match(CypherParser.EXISTS);
            this.state = 1765;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1764;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1767;
            this.match(CypherParser.T__6);
            this.state = 1769;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1768;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1787;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 329, this.context) ) {
            case 1:
                {
                this.state = 1771;
                this.oC_RegularQuery();
                }
                break;
            case 2:
                {
                {
                this.state = 1776;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                do {
                    {
                    {
                    this.state = 1772;
                    this.oC_ReadingClause();
                    this.state = 1774;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 325, this.context) ) {
                    case 1:
                        {
                        this.state = 1773;
                        this.match(CypherParser.SP);
                        }
                        break;
                    }
                    }
                    }
                    this.state = 1778;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                } while (((((_la - 53)) & ~0x1F) === 0 && ((1 << (_la - 53)) & 131521) !== 0));
                }
                }
                break;
            case 3:
                {
                {
                this.state = 1780;
                this.oC_Pattern();
                this.state = 1785;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 328, this.context) ) {
                case 1:
                    {
                    this.state = 1782;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1781;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1784;
                    this.oC_Where();
                    }
                    break;
                }
                }
                }
                break;
            }
            this.state = 1790;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1789;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1792;
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
        this.enterRule(localContext, 192, CypherParser.RULE_oC_ExplicitProcedureInvocation);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1794;
            this.oC_ProcedureName();
            this.state = 1796;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1795;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1798;
            this.match(CypherParser.T__2);
            this.state = 1800;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1799;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1819;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 70258824) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 8392671) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 536623139) !== 0) || ((((_la - 119)) & ~0x1F) === 0 && ((1 << (_la - 119)) & 647175) !== 0)) {
                {
                this.state = 1802;
                this.oC_Expression();
                this.state = 1804;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1803;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1816;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 4) {
                    {
                    {
                    this.state = 1806;
                    this.match(CypherParser.T__3);
                    this.state = 1808;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1807;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1810;
                    this.oC_Expression();
                    this.state = 1812;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1811;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 1818;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            this.state = 1821;
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
        this.enterRule(localContext, 194, CypherParser.RULE_oC_ImplicitProcedureInvocation);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1823;
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
        this.enterRule(localContext, 196, CypherParser.RULE_oC_ProcedureResultField);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1825;
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
        this.enterRule(localContext, 198, CypherParser.RULE_oC_ProcedureName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1827;
            this.oC_Namespace();
            this.state = 1828;
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
        this.enterRule(localContext, 200, CypherParser.RULE_oC_Namespace);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1835;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 338, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1830;
                    this.oC_SymbolicName();
                    this.state = 1831;
                    this.match(CypherParser.T__24);
                    }
                    }
                }
                this.state = 1837;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 338, this.context);
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
        this.enterRule(localContext, 202, CypherParser.RULE_oC_Variable);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1838;
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
        this.enterRule(localContext, 204, CypherParser.RULE_oC_Literal);
        try {
            this.state = 1846;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.TRUE:
            case CypherParser.FALSE:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1840;
                this.oC_BooleanLiteral();
                }
                break;
            case CypherParser.NULL:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1841;
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
                this.state = 1842;
                this.oC_NumberLiteral();
                }
                break;
            case CypherParser.StringLiteral:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 1843;
                this.match(CypherParser.StringLiteral);
                }
                break;
            case CypherParser.T__11:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 1844;
                this.oC_ListLiteral();
                }
                break;
            case CypherParser.T__6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 1845;
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
        this.enterRule(localContext, 206, CypherParser.RULE_oC_BooleanLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1848;
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
        this.enterRule(localContext, 208, CypherParser.RULE_oC_NumberLiteral);
        try {
            this.state = 1852;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.ExponentDecimalReal:
            case CypherParser.RegularDecimalReal:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1850;
                this.oC_DoubleLiteral();
                }
                break;
            case CypherParser.HexInteger:
            case CypherParser.DecimalInteger:
            case CypherParser.OctalInteger:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1851;
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
        this.enterRule(localContext, 210, CypherParser.RULE_oC_IntegerLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1854;
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
        this.enterRule(localContext, 212, CypherParser.RULE_oC_DoubleLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1856;
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
        this.enterRule(localContext, 214, CypherParser.RULE_oC_ListLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1858;
            this.match(CypherParser.T__11);
            this.state = 1860;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1859;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1879;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 70258824) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 8392671) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 536623139) !== 0) || ((((_la - 119)) & ~0x1F) === 0 && ((1 << (_la - 119)) & 647175) !== 0)) {
                {
                this.state = 1862;
                this.oC_Expression();
                this.state = 1864;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1863;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1876;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 4) {
                    {
                    {
                    this.state = 1866;
                    this.match(CypherParser.T__3);
                    this.state = 1868;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1867;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1870;
                    this.oC_Expression();
                    this.state = 1872;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1871;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 1878;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            this.state = 1881;
            this.match(CypherParser.T__12);
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
        this.enterRule(localContext, 216, CypherParser.RULE_oC_MapLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1883;
            this.match(CypherParser.T__6);
            this.state = 1885;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1884;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1920;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 4244635647) !== 0) || ((((_la - 78)) & ~0x1F) === 0 && ((1 << (_la - 78)) & 2147483647) !== 0) || ((((_la - 112)) & ~0x1F) === 0 && ((1 << (_la - 112)) & 83884033) !== 0)) {
                {
                this.state = 1887;
                this.oC_PropertyKeyName();
                this.state = 1889;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1888;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1891;
                this.match(CypherParser.T__1);
                this.state = 1893;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1892;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1895;
                this.oC_Expression();
                this.state = 1897;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1896;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1917;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 4) {
                    {
                    {
                    this.state = 1899;
                    this.match(CypherParser.T__3);
                    this.state = 1901;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1900;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1903;
                    this.oC_PropertyKeyName();
                    this.state = 1905;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1904;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1907;
                    this.match(CypherParser.T__1);
                    this.state = 1909;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1908;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1911;
                    this.oC_Expression();
                    this.state = 1913;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1912;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 1919;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            this.state = 1922;
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
        this.enterRule(localContext, 218, CypherParser.RULE_oC_PropertyKeyName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1924;
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
        this.enterRule(localContext, 220, CypherParser.RULE_oC_Parameter);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1926;
            this.match(CypherParser.T__25);
            this.state = 1929;
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
            case CypherParser.SHORTESTPATH:
            case CypherParser.ALLSHORTESTPATHS:
            case CypherParser.COUNT:
            case CypherParser.ANY:
            case CypherParser.NONE:
            case CypherParser.SINGLE:
            case CypherParser.REDUCE:
            case CypherParser.HexLetter:
            case CypherParser.DROP:
            case CypherParser.FILTER:
            case CypherParser.EXTRACT:
            case CypherParser.UnescapedSymbolicName:
            case CypherParser.EscapedSymbolicName:
                {
                this.state = 1927;
                this.oC_SymbolicName();
                }
                break;
            case CypherParser.DecimalInteger:
                {
                this.state = 1928;
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
        this.enterRule(localContext, 222, CypherParser.RULE_oC_SchemaName);
        try {
            this.state = 1933;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 358, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1931;
                this.oC_SymbolicName();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1932;
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
        this.enterRule(localContext, 224, CypherParser.RULE_oC_ReservedWord);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1935;
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
        this.enterRule(localContext, 226, CypherParser.RULE_oC_SymbolicName);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1937;
            _la = this.tokenStream.LA(1);
            if(!(((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 8392607) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 272371715) !== 0) || ((((_la - 132)) & ~0x1F) === 0 && ((1 << (_la - 132)) & 79) !== 0))) {
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
    public oC_LeftArrowHead(): OC_LeftArrowHeadContext {
        let localContext = new OC_LeftArrowHeadContext(this.context, this.state);
        this.enterRule(localContext, 228, CypherParser.RULE_oC_LeftArrowHead);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1939;
            _la = this.tokenStream.LA(1);
            if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 2013331456) !== 0))) {
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
        this.enterRule(localContext, 230, CypherParser.RULE_oC_RightArrowHead);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1941;
            _la = this.tokenStream.LA(1);
            if(!(((((_la - 17)) & ~0x1F) === 0 && ((1 << (_la - 17)) & 245761) !== 0))) {
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
        this.enterRule(localContext, 232, CypherParser.RULE_oC_Dash);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1943;
            _la = this.tokenStream.LA(1);
            if(!(((((_la - 21)) & ~0x1F) === 0 && ((1 << (_la - 21)) & 33538049) !== 0))) {
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
        4,1,141,1946,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,
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
        2,115,7,115,2,116,7,116,1,0,3,0,236,8,0,1,0,1,0,3,0,240,8,0,1,0,
        3,0,243,8,0,1,0,3,0,246,8,0,1,0,1,0,1,1,1,1,1,2,1,2,1,2,3,2,255,
        8,2,1,3,1,3,1,3,1,3,3,3,261,8,3,1,4,1,4,1,4,1,4,1,4,3,4,268,8,4,
        1,4,1,4,3,4,272,8,4,1,4,1,4,3,4,276,8,4,1,4,1,4,3,4,280,8,4,1,4,
        1,4,3,4,284,8,4,1,4,1,4,1,4,1,4,3,4,290,8,4,1,4,1,4,3,4,294,8,4,
        1,4,1,4,3,4,298,8,4,1,4,1,4,3,4,302,8,4,1,4,3,4,305,8,4,1,4,1,4,
        3,4,309,8,4,1,4,3,4,312,8,4,1,5,1,5,1,5,1,5,1,5,3,5,319,8,5,1,5,
        1,5,3,5,323,8,5,1,5,1,5,3,5,327,8,5,1,5,1,5,3,5,331,8,5,1,5,1,5,
        3,5,335,8,5,1,5,1,5,1,5,1,5,3,5,341,8,5,1,5,1,5,3,5,345,8,5,1,5,
        1,5,3,5,349,8,5,1,5,1,5,3,5,353,8,5,1,5,3,5,356,8,5,1,5,1,5,3,5,
        360,8,5,1,5,3,5,363,8,5,1,6,1,6,1,7,1,7,3,7,369,8,7,1,8,1,8,3,8,
        373,8,8,1,8,1,8,3,8,377,8,8,1,8,1,8,3,8,381,8,8,1,8,5,8,384,8,8,
        10,8,12,8,387,9,8,1,8,3,8,390,8,8,1,8,1,8,1,9,1,9,1,9,1,9,1,9,1,
        9,3,9,400,8,9,1,9,1,9,1,9,1,9,1,9,1,9,3,9,408,8,9,1,9,1,9,3,9,412,
        8,9,1,9,5,9,415,8,9,10,9,12,9,418,9,9,1,9,1,9,3,9,422,8,9,1,10,1,
        10,1,10,1,10,1,10,1,10,3,10,430,8,10,1,10,1,10,1,10,1,10,1,10,1,
        10,3,10,438,8,10,1,10,1,10,3,10,442,8,10,1,10,5,10,445,8,10,10,10,
        12,10,448,9,10,1,10,1,10,3,10,452,8,10,1,11,1,11,1,11,1,11,1,11,
        1,11,1,11,1,11,3,11,462,8,11,1,12,1,12,3,12,466,8,12,1,12,5,12,469,
        8,12,10,12,12,12,472,9,12,1,13,1,13,1,13,1,13,3,13,478,8,13,1,13,
        1,13,1,13,3,13,483,8,13,1,13,3,13,486,8,13,1,14,1,14,3,14,490,8,
        14,1,15,1,15,3,15,494,8,15,5,15,496,8,15,10,15,12,15,499,9,15,1,
        15,1,15,1,15,3,15,504,8,15,5,15,506,8,15,10,15,12,15,509,9,15,1,
        15,1,15,3,15,513,8,15,1,15,5,15,516,8,15,10,15,12,15,519,9,15,1,
        15,3,15,522,8,15,1,15,3,15,525,8,15,3,15,527,8,15,1,16,1,16,3,16,
        531,8,16,5,16,533,8,16,10,16,12,16,536,9,16,1,16,1,16,3,16,540,8,
        16,5,16,542,8,16,10,16,12,16,545,9,16,1,16,1,16,3,16,549,8,16,4,
        16,551,8,16,11,16,12,16,552,1,16,1,16,1,17,1,17,1,17,1,17,1,17,1,
        17,1,17,3,17,564,8,17,1,18,1,18,1,18,1,18,1,18,3,18,571,8,18,1,19,
        1,19,1,19,1,19,1,19,1,19,1,19,3,19,580,8,19,1,19,1,19,1,19,1,19,
        1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,3,19,594,8,19,1,20,1,20,
        3,20,598,8,20,1,20,1,20,3,20,602,8,20,1,20,1,20,1,20,1,20,1,20,1,
        20,3,20,610,8,20,1,20,1,20,3,20,614,8,20,1,20,4,20,617,8,20,11,20,
        12,20,618,1,20,3,20,622,8,20,1,20,1,20,1,21,1,21,3,21,628,8,21,1,
        21,1,21,3,21,632,8,21,1,21,1,21,3,21,636,8,21,1,21,1,21,1,22,1,22,
        3,22,642,8,22,1,22,1,22,3,22,646,8,22,1,22,1,22,3,22,650,8,22,1,
        22,3,22,653,8,22,1,23,1,23,3,23,657,8,23,1,23,1,23,1,23,1,23,1,23,
        1,23,1,24,1,24,3,24,667,8,24,1,24,1,24,1,24,5,24,672,8,24,10,24,
        12,24,675,9,24,1,25,1,25,1,25,1,25,1,25,1,25,1,25,1,25,1,25,1,25,
        3,25,687,8,25,1,26,1,26,3,26,691,8,26,1,26,1,26,1,27,1,27,3,27,697,
        8,27,1,27,1,27,3,27,701,8,27,1,27,1,27,3,27,705,8,27,1,27,5,27,708,
        8,27,10,27,12,27,711,9,27,1,28,1,28,3,28,715,8,28,1,28,1,28,3,28,
        719,8,28,1,28,1,28,1,28,1,28,3,28,725,8,28,1,28,1,28,3,28,729,8,
        28,1,28,1,28,1,28,1,28,3,28,735,8,28,1,28,1,28,3,28,739,8,28,1,28,
        1,28,1,28,1,28,3,28,745,8,28,1,28,1,28,3,28,749,8,28,1,29,1,29,3,
        29,753,8,29,1,29,1,29,3,29,757,8,29,1,29,1,29,3,29,761,8,29,1,29,
        1,29,3,29,765,8,29,1,29,5,29,768,8,29,10,29,12,29,771,9,29,1,30,
        1,30,1,30,1,30,3,30,777,8,30,1,30,1,30,3,30,781,8,30,1,30,5,30,784,
        8,30,10,30,12,30,787,9,30,1,31,1,31,1,31,1,31,3,31,793,8,31,1,32,
        1,32,1,32,1,32,3,32,799,8,32,1,32,1,32,1,32,3,32,804,8,32,1,33,1,
        33,1,33,1,33,3,33,810,8,33,1,33,3,33,813,8,33,1,33,1,33,1,33,1,33,
        3,33,819,8,33,3,33,821,8,33,1,34,1,34,3,34,825,8,34,1,34,1,34,3,
        34,829,8,34,1,34,5,34,832,8,34,10,34,12,34,835,9,34,1,34,3,34,838,
        8,34,1,34,3,34,841,8,34,1,35,1,35,1,35,1,35,1,35,3,35,848,8,35,1,
        35,1,35,1,36,1,36,1,36,3,36,855,8,36,1,36,3,36,858,8,36,1,37,1,37,
        1,37,1,38,3,38,864,8,38,1,38,3,38,867,8,38,1,38,1,38,1,38,1,38,3,
        38,873,8,38,1,38,1,38,3,38,877,8,38,1,38,1,38,3,38,881,8,38,1,39,
        1,39,3,39,885,8,39,1,39,1,39,3,39,889,8,39,1,39,5,39,892,8,39,10,
        39,12,39,895,9,39,1,39,1,39,3,39,899,8,39,1,39,1,39,3,39,903,8,39,
        1,39,5,39,906,8,39,10,39,12,39,909,9,39,3,39,911,8,39,1,40,1,40,
        1,40,1,40,1,40,1,40,1,40,3,40,920,8,40,1,41,1,41,1,41,1,41,1,41,
        1,41,1,41,3,41,929,8,41,1,41,5,41,932,8,41,10,41,12,41,935,9,41,
        1,42,1,42,1,42,1,42,1,43,1,43,1,43,1,43,1,44,1,44,3,44,947,8,44,
        1,44,3,44,950,8,44,1,45,1,45,1,45,1,45,1,46,1,46,3,46,958,8,46,1,
        46,1,46,3,46,962,8,46,1,46,5,46,965,8,46,10,46,12,46,968,9,46,1,
        47,1,47,3,47,972,8,47,1,47,1,47,3,47,976,8,47,1,47,1,47,1,47,3,47,
        981,8,47,1,48,1,48,3,48,985,8,48,1,49,1,49,3,49,989,8,49,1,49,1,
        49,3,49,993,8,49,1,49,1,49,3,49,997,8,49,1,49,1,49,1,50,1,50,3,50,
        1003,8,50,1,50,5,50,1006,8,50,10,50,12,50,1009,9,50,1,50,1,50,1,
        50,1,50,3,50,1015,8,50,1,51,1,51,3,51,1019,8,51,1,51,4,51,1022,8,
        51,11,51,12,51,1023,1,52,1,52,3,52,1028,8,52,1,52,1,52,3,52,1032,
        8,52,3,52,1034,8,52,1,52,1,52,3,52,1038,8,52,3,52,1040,8,52,1,52,
        1,52,3,52,1044,8,52,3,52,1046,8,52,1,52,1,52,1,53,1,53,3,53,1052,
        8,53,1,53,1,53,1,54,1,54,3,54,1058,8,54,1,54,1,54,3,54,1062,8,54,
        1,54,3,54,1065,8,54,1,54,3,54,1068,8,54,1,54,1,54,3,54,1072,8,54,
        1,54,1,54,1,54,1,54,3,54,1078,8,54,1,54,1,54,3,54,1082,8,54,1,54,
        3,54,1085,8,54,1,54,3,54,1088,8,54,1,54,1,54,1,54,1,54,3,54,1094,
        8,54,1,54,3,54,1097,8,54,1,54,3,54,1100,8,54,1,54,1,54,3,54,1104,
        8,54,1,54,1,54,1,54,1,54,3,54,1110,8,54,1,54,3,54,1113,8,54,1,54,
        3,54,1116,8,54,1,54,1,54,3,54,1120,8,54,1,55,1,55,3,55,1124,8,55,
        1,55,1,55,3,55,1128,8,55,3,55,1130,8,55,1,55,1,55,3,55,1134,8,55,
        3,55,1136,8,55,1,55,3,55,1139,8,55,1,55,1,55,3,55,1143,8,55,3,55,
        1145,8,55,1,55,1,55,1,56,1,56,3,56,1151,8,56,1,57,1,57,3,57,1155,
        8,57,1,57,1,57,3,57,1159,8,57,1,57,1,57,3,57,1163,8,57,1,57,3,57,
        1166,8,57,1,57,5,57,1169,8,57,10,57,12,57,1172,9,57,1,58,1,58,3,
        58,1176,8,58,1,58,5,58,1179,8,58,10,58,12,58,1182,9,58,1,59,1,59,
        3,59,1186,8,59,1,59,1,59,1,60,1,60,3,60,1192,8,60,1,60,1,60,3,60,
        1196,8,60,3,60,1198,8,60,1,60,1,60,3,60,1202,8,60,1,60,1,60,3,60,
        1206,8,60,3,60,1208,8,60,3,60,1210,8,60,1,61,1,61,1,62,1,62,1,63,
        1,63,3,63,1218,8,63,1,63,4,63,1221,8,63,11,63,12,63,1222,1,64,1,
        64,1,65,1,65,1,65,1,65,1,65,5,65,1232,8,65,10,65,12,65,1235,9,65,
        1,66,1,66,1,66,1,66,1,66,5,66,1242,8,66,10,66,12,66,1245,9,66,1,
        67,1,67,1,67,1,67,1,67,5,67,1252,8,67,10,67,12,67,1255,9,67,1,68,
        1,68,3,68,1259,8,68,5,68,1261,8,68,10,68,12,68,1264,9,68,1,68,1,
        68,1,69,1,69,3,69,1270,8,69,1,69,5,69,1273,8,69,10,69,12,69,1276,
        9,69,1,70,1,70,3,70,1280,8,70,1,70,1,70,1,70,3,70,1285,8,70,1,70,
        1,70,1,70,3,70,1290,8,70,1,70,1,70,1,70,3,70,1295,8,70,1,70,1,70,
        1,70,3,70,1300,8,70,1,70,1,70,1,70,3,70,1305,8,70,1,70,3,70,1308,
        8,70,1,71,1,71,1,71,1,71,5,71,1314,8,71,10,71,12,71,1317,9,71,1,
        72,1,72,1,72,1,72,1,72,1,72,1,72,1,72,1,72,1,72,3,72,1329,8,72,1,
        72,3,72,1332,8,72,1,72,1,72,1,73,1,73,1,73,3,73,1339,8,73,1,73,1,
        73,1,74,1,74,1,74,1,74,1,74,1,74,1,74,1,74,1,74,1,74,3,74,1353,8,
        74,1,75,1,75,3,75,1357,8,75,1,75,1,75,3,75,1361,8,75,1,75,1,75,3,
        75,1365,8,75,1,75,1,75,3,75,1369,8,75,1,75,5,75,1372,8,75,10,75,
        12,75,1375,9,75,1,76,1,76,3,76,1379,8,76,1,76,1,76,3,76,1383,8,76,
        1,76,1,76,3,76,1387,8,76,1,76,1,76,3,76,1391,8,76,1,76,1,76,3,76,
        1395,8,76,1,76,1,76,3,76,1399,8,76,1,76,5,76,1402,8,76,10,76,12,
        76,1405,9,76,1,77,1,77,3,77,1409,8,77,1,77,1,77,3,77,1413,8,77,1,
        77,5,77,1416,8,77,10,77,12,77,1419,9,77,1,78,1,78,1,78,3,78,1424,
        8,78,1,78,3,78,1427,8,78,1,79,1,79,3,79,1431,8,79,1,79,1,79,3,79,
        1435,8,79,1,79,5,79,1438,8,79,10,79,12,79,1441,9,79,1,79,3,79,1444,
        8,79,1,79,3,79,1447,8,79,1,80,1,80,1,80,1,80,1,80,1,80,3,80,1455,
        8,80,1,80,1,80,3,80,1459,8,80,1,80,3,80,1462,8,80,1,81,1,81,3,81,
        1466,8,81,1,81,1,81,1,82,1,82,1,82,1,82,1,82,3,82,1475,8,82,1,82,
        1,82,3,82,1479,8,82,1,82,1,82,3,82,1483,8,82,1,82,1,82,1,82,1,82,
        1,82,1,82,1,82,1,82,1,82,1,82,1,82,3,82,1496,8,82,1,83,1,83,3,83,
        1500,8,83,1,83,4,83,1503,8,83,11,83,12,83,1504,1,83,1,83,3,83,1509,
        8,83,1,83,1,83,3,83,1513,8,83,1,83,4,83,1516,8,83,11,83,12,83,1517,
        3,83,1520,8,83,1,83,3,83,1523,8,83,1,83,1,83,3,83,1527,8,83,1,83,
        3,83,1530,8,83,1,83,3,83,1533,8,83,1,83,1,83,1,84,1,84,3,84,1539,
        8,84,1,84,1,84,3,84,1543,8,84,1,84,1,84,3,84,1547,8,84,1,84,1,84,
        1,85,1,85,3,85,1553,8,85,1,85,1,85,3,85,1557,8,85,1,85,1,85,3,85,
        1561,8,85,1,85,3,85,1564,8,85,1,85,3,85,1567,8,85,1,85,1,85,1,86,
        1,86,3,86,1573,8,86,1,86,1,86,3,86,1577,8,86,1,86,1,86,3,86,1581,
        8,86,3,86,1583,8,86,1,86,1,86,3,86,1587,8,86,1,86,1,86,3,86,1591,
        8,86,3,86,1593,8,86,1,86,1,86,3,86,1597,8,86,1,86,1,86,3,86,1601,
        8,86,1,86,1,86,1,87,1,87,3,87,1607,8,87,1,87,1,87,3,87,1611,8,87,
        1,87,1,87,3,87,1615,8,87,1,87,1,87,1,87,1,87,3,87,1621,8,87,1,87,
        1,87,3,87,1625,8,87,1,87,1,87,3,87,1629,8,87,1,87,1,87,1,87,1,87,
        3,87,1635,8,87,1,87,1,87,3,87,1639,8,87,1,87,1,87,3,87,1643,8,87,
        1,87,1,87,1,87,1,87,3,87,1649,8,87,1,87,1,87,3,87,1653,8,87,1,87,
        1,87,3,87,1657,8,87,1,87,1,87,3,87,1661,8,87,1,88,1,88,3,88,1665,
        8,88,1,88,3,88,1668,8,88,1,89,1,89,1,90,1,90,3,90,1674,8,90,1,90,
        1,90,3,90,1678,8,90,1,90,1,90,1,91,1,91,1,91,1,91,1,91,1,91,1,92,
        1,92,3,92,1690,8,92,1,92,1,92,3,92,1694,8,92,1,92,1,92,3,92,1698,
        8,92,1,92,1,92,3,92,1702,8,92,1,92,1,92,3,92,1706,8,92,1,92,1,92,
        3,92,1710,8,92,1,92,1,92,3,92,1714,8,92,1,92,1,92,3,92,1718,8,92,
        1,92,1,92,3,92,1722,8,92,1,92,1,92,1,93,1,93,3,93,1728,8,93,1,93,
        1,93,3,93,1732,8,93,1,93,1,93,3,93,1736,8,93,3,93,1738,8,93,1,93,
        1,93,3,93,1742,8,93,1,93,1,93,3,93,1746,8,93,1,93,1,93,3,93,1750,
        8,93,5,93,1752,8,93,10,93,12,93,1755,9,93,3,93,1757,8,93,1,93,1,
        93,1,94,1,94,1,94,1,95,1,95,3,95,1766,8,95,1,95,1,95,3,95,1770,8,
        95,1,95,1,95,1,95,3,95,1775,8,95,4,95,1777,8,95,11,95,12,95,1778,
        1,95,1,95,3,95,1783,8,95,1,95,3,95,1786,8,95,3,95,1788,8,95,1,95,
        3,95,1791,8,95,1,95,1,95,1,96,1,96,3,96,1797,8,96,1,96,1,96,3,96,
        1801,8,96,1,96,1,96,3,96,1805,8,96,1,96,1,96,3,96,1809,8,96,1,96,
        1,96,3,96,1813,8,96,5,96,1815,8,96,10,96,12,96,1818,9,96,3,96,1820,
        8,96,1,96,1,96,1,97,1,97,1,98,1,98,1,99,1,99,1,99,1,100,1,100,1,
        100,5,100,1834,8,100,10,100,12,100,1837,9,100,1,101,1,101,1,102,
        1,102,1,102,1,102,1,102,1,102,3,102,1847,8,102,1,103,1,103,1,104,
        1,104,3,104,1853,8,104,1,105,1,105,1,106,1,106,1,107,1,107,3,107,
        1861,8,107,1,107,1,107,3,107,1865,8,107,1,107,1,107,3,107,1869,8,
        107,1,107,1,107,3,107,1873,8,107,5,107,1875,8,107,10,107,12,107,
        1878,9,107,3,107,1880,8,107,1,107,1,107,1,108,1,108,3,108,1886,8,
        108,1,108,1,108,3,108,1890,8,108,1,108,1,108,3,108,1894,8,108,1,
        108,1,108,3,108,1898,8,108,1,108,1,108,3,108,1902,8,108,1,108,1,
        108,3,108,1906,8,108,1,108,1,108,3,108,1910,8,108,1,108,1,108,3,
        108,1914,8,108,5,108,1916,8,108,10,108,12,108,1919,9,108,3,108,1921,
        8,108,1,108,1,108,1,109,1,109,1,110,1,110,1,110,3,110,1930,8,110,
        1,111,1,111,3,111,1934,8,111,1,112,1,112,1,113,1,113,1,114,1,114,
        1,115,1,115,1,116,1,116,1,116,0,0,117,0,2,4,6,8,10,12,14,16,18,20,
        22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,60,62,64,
        66,68,70,72,74,76,78,80,82,84,86,88,90,92,94,96,98,100,102,104,106,
        108,110,112,114,116,118,120,122,124,126,128,130,132,134,136,138,
        140,142,144,146,148,150,152,154,156,158,160,162,164,166,168,170,
        172,174,176,178,180,182,184,186,188,190,192,194,196,198,200,202,
        204,206,208,210,212,214,216,218,220,222,224,226,228,230,232,0,12,
        1,0,48,49,1,0,79,82,1,0,84,85,1,0,20,21,1,0,107,108,1,0,109,111,
        1,0,119,120,7,0,51,52,58,69,72,83,86,95,97,101,106,108,123,132,9,
        0,46,50,53,57,69,69,84,85,96,96,102,105,112,112,132,135,138,138,
        2,0,16,16,27,30,2,0,17,17,31,34,2,0,21,21,35,45,2228,0,235,1,0,0,
        0,2,249,1,0,0,0,4,254,1,0,0,0,6,260,1,0,0,0,8,262,1,0,0,0,10,313,
        1,0,0,0,12,364,1,0,0,0,14,368,1,0,0,0,16,370,1,0,0,0,18,393,1,0,
        0,0,20,423,1,0,0,0,22,461,1,0,0,0,24,463,1,0,0,0,26,485,1,0,0,0,
        28,489,1,0,0,0,30,526,1,0,0,0,32,550,1,0,0,0,34,563,1,0,0,0,36,570,
        1,0,0,0,38,572,1,0,0,0,40,595,1,0,0,0,42,625,1,0,0,0,44,641,1,0,
        0,0,46,654,1,0,0,0,48,664,1,0,0,0,50,686,1,0,0,0,52,688,1,0,0,0,
        54,694,1,0,0,0,56,748,1,0,0,0,58,752,1,0,0,0,60,772,1,0,0,0,62,792,
        1,0,0,0,64,794,1,0,0,0,66,805,1,0,0,0,68,822,1,0,0,0,70,847,1,0,
        0,0,72,851,1,0,0,0,74,859,1,0,0,0,76,866,1,0,0,0,78,910,1,0,0,0,
        80,919,1,0,0,0,82,921,1,0,0,0,84,936,1,0,0,0,86,940,1,0,0,0,88,944,
        1,0,0,0,90,951,1,0,0,0,92,955,1,0,0,0,94,980,1,0,0,0,96,984,1,0,
        0,0,98,986,1,0,0,0,100,1014,1,0,0,0,102,1016,1,0,0,0,104,1025,1,
        0,0,0,106,1049,1,0,0,0,108,1119,1,0,0,0,110,1121,1,0,0,0,112,1150,
        1,0,0,0,114,1152,1,0,0,0,116,1173,1,0,0,0,118,1183,1,0,0,0,120,1189,
        1,0,0,0,122,1211,1,0,0,0,124,1213,1,0,0,0,126,1215,1,0,0,0,128,1224,
        1,0,0,0,130,1226,1,0,0,0,132,1236,1,0,0,0,134,1246,1,0,0,0,136,1262,
        1,0,0,0,138,1267,1,0,0,0,140,1307,1,0,0,0,142,1309,1,0,0,0,144,1328,
        1,0,0,0,146,1335,1,0,0,0,148,1352,1,0,0,0,150,1354,1,0,0,0,152,1376,
        1,0,0,0,154,1406,1,0,0,0,156,1426,1,0,0,0,158,1428,1,0,0,0,160,1461,
        1,0,0,0,162,1463,1,0,0,0,164,1495,1,0,0,0,166,1519,1,0,0,0,168,1536,
        1,0,0,0,170,1550,1,0,0,0,172,1570,1,0,0,0,174,1660,1,0,0,0,176,1662,
        1,0,0,0,178,1669,1,0,0,0,180,1671,1,0,0,0,182,1681,1,0,0,0,184,1687,
        1,0,0,0,186,1725,1,0,0,0,188,1760,1,0,0,0,190,1763,1,0,0,0,192,1794,
        1,0,0,0,194,1823,1,0,0,0,196,1825,1,0,0,0,198,1827,1,0,0,0,200,1835,
        1,0,0,0,202,1838,1,0,0,0,204,1846,1,0,0,0,206,1848,1,0,0,0,208,1852,
        1,0,0,0,210,1854,1,0,0,0,212,1856,1,0,0,0,214,1858,1,0,0,0,216,1883,
        1,0,0,0,218,1924,1,0,0,0,220,1926,1,0,0,0,222,1933,1,0,0,0,224,1935,
        1,0,0,0,226,1937,1,0,0,0,228,1939,1,0,0,0,230,1941,1,0,0,0,232,1943,
        1,0,0,0,234,236,5,139,0,0,235,234,1,0,0,0,235,236,1,0,0,0,236,237,
        1,0,0,0,237,242,3,2,1,0,238,240,5,139,0,0,239,238,1,0,0,0,239,240,
        1,0,0,0,240,241,1,0,0,0,241,243,5,1,0,0,242,239,1,0,0,0,242,243,
        1,0,0,0,243,245,1,0,0,0,244,246,5,139,0,0,245,244,1,0,0,0,245,246,
        1,0,0,0,246,247,1,0,0,0,247,248,5,0,0,1,248,1,1,0,0,0,249,250,3,
        4,2,0,250,3,1,0,0,0,251,255,3,24,12,0,252,255,3,66,33,0,253,255,
        3,6,3,0,254,251,1,0,0,0,254,252,1,0,0,0,254,253,1,0,0,0,255,5,1,
        0,0,0,256,261,3,8,4,0,257,261,3,10,5,0,258,261,3,18,9,0,259,261,
        3,20,10,0,260,256,1,0,0,0,260,257,1,0,0,0,260,258,1,0,0,0,260,259,
        1,0,0,0,261,7,1,0,0,0,262,263,5,65,0,0,263,267,5,139,0,0,264,265,
        3,12,6,0,265,266,5,139,0,0,266,268,1,0,0,0,267,264,1,0,0,0,267,268,
        1,0,0,0,268,269,1,0,0,0,269,271,5,46,0,0,270,272,5,139,0,0,271,270,
        1,0,0,0,271,272,1,0,0,0,272,301,1,0,0,0,273,275,5,125,0,0,274,276,
        5,139,0,0,275,274,1,0,0,0,275,276,1,0,0,0,276,277,1,0,0,0,277,279,
        3,14,7,0,278,280,5,139,0,0,279,278,1,0,0,0,279,280,1,0,0,0,280,281,
        1,0,0,0,281,283,5,64,0,0,282,284,5,139,0,0,283,282,1,0,0,0,283,284,
        1,0,0,0,284,285,1,0,0,0,285,286,3,16,8,0,286,302,1,0,0,0,287,289,
        5,64,0,0,288,290,5,139,0,0,289,288,1,0,0,0,289,290,1,0,0,0,290,291,
        1,0,0,0,291,293,5,2,0,0,292,294,5,139,0,0,293,292,1,0,0,0,293,294,
        1,0,0,0,294,295,1,0,0,0,295,297,3,122,61,0,296,298,5,139,0,0,297,
        296,1,0,0,0,297,298,1,0,0,0,298,299,1,0,0,0,299,300,3,16,8,0,300,
        302,1,0,0,0,301,273,1,0,0,0,301,287,1,0,0,0,302,311,1,0,0,0,303,
        305,5,139,0,0,304,303,1,0,0,0,304,305,1,0,0,0,305,306,1,0,0,0,306,
        308,5,50,0,0,307,309,5,139,0,0,308,307,1,0,0,0,308,309,1,0,0,0,309,
        310,1,0,0,0,310,312,3,216,108,0,311,304,1,0,0,0,311,312,1,0,0,0,
        312,9,1,0,0,0,313,314,5,132,0,0,314,318,5,139,0,0,315,316,3,12,6,
        0,316,317,5,139,0,0,317,319,1,0,0,0,318,315,1,0,0,0,318,319,1,0,
        0,0,319,320,1,0,0,0,320,322,5,46,0,0,321,323,5,139,0,0,322,321,1,
        0,0,0,322,323,1,0,0,0,323,352,1,0,0,0,324,326,5,125,0,0,325,327,
        5,139,0,0,326,325,1,0,0,0,326,327,1,0,0,0,327,328,1,0,0,0,328,330,
        3,14,7,0,329,331,5,139,0,0,330,329,1,0,0,0,330,331,1,0,0,0,331,332,
        1,0,0,0,332,334,5,64,0,0,333,335,5,139,0,0,334,333,1,0,0,0,334,335,
        1,0,0,0,335,336,1,0,0,0,336,337,3,16,8,0,337,353,1,0,0,0,338,340,
        5,64,0,0,339,341,5,139,0,0,340,339,1,0,0,0,340,341,1,0,0,0,341,342,
        1,0,0,0,342,344,5,2,0,0,343,345,5,139,0,0,344,343,1,0,0,0,344,345,
        1,0,0,0,345,346,1,0,0,0,346,348,3,122,61,0,347,349,5,139,0,0,348,
        347,1,0,0,0,348,349,1,0,0,0,349,350,1,0,0,0,350,351,3,16,8,0,351,
        353,1,0,0,0,352,324,1,0,0,0,352,338,1,0,0,0,353,362,1,0,0,0,354,
        356,5,139,0,0,355,354,1,0,0,0,355,356,1,0,0,0,356,357,1,0,0,0,357,
        359,5,50,0,0,358,360,5,139,0,0,359,358,1,0,0,0,359,360,1,0,0,0,360,
        361,1,0,0,0,361,363,3,216,108,0,362,355,1,0,0,0,362,363,1,0,0,0,
        363,11,1,0,0,0,364,365,7,0,0,0,365,13,1,0,0,0,366,369,3,104,52,0,
        367,369,3,102,51,0,368,366,1,0,0,0,368,367,1,0,0,0,369,15,1,0,0,
        0,370,372,5,3,0,0,371,373,5,139,0,0,372,371,1,0,0,0,372,373,1,0,
        0,0,373,374,1,0,0,0,374,385,3,128,64,0,375,377,5,139,0,0,376,375,
        1,0,0,0,376,377,1,0,0,0,377,378,1,0,0,0,378,380,5,4,0,0,379,381,
        5,139,0,0,380,379,1,0,0,0,380,381,1,0,0,0,381,382,1,0,0,0,382,384,
        3,128,64,0,383,376,1,0,0,0,384,387,1,0,0,0,385,383,1,0,0,0,385,386,
        1,0,0,0,386,389,1,0,0,0,387,385,1,0,0,0,388,390,5,139,0,0,389,388,
        1,0,0,0,389,390,1,0,0,0,390,391,1,0,0,0,391,392,5,5,0,0,392,17,1,
        0,0,0,393,394,5,65,0,0,394,395,5,139,0,0,395,396,5,123,0,0,396,397,
        5,139,0,0,397,399,5,64,0,0,398,400,5,139,0,0,399,398,1,0,0,0,399,
        400,1,0,0,0,400,401,1,0,0,0,401,402,3,14,7,0,402,403,5,139,0,0,403,
        404,5,47,0,0,404,405,5,139,0,0,405,416,3,128,64,0,406,408,5,139,
        0,0,407,406,1,0,0,0,407,408,1,0,0,0,408,409,1,0,0,0,409,411,5,4,
        0,0,410,412,5,139,0,0,411,410,1,0,0,0,411,412,1,0,0,0,412,413,1,
        0,0,0,413,415,3,128,64,0,414,407,1,0,0,0,415,418,1,0,0,0,416,414,
        1,0,0,0,416,417,1,0,0,0,417,421,1,0,0,0,418,416,1,0,0,0,419,420,
        5,139,0,0,420,422,3,22,11,0,421,419,1,0,0,0,421,422,1,0,0,0,422,
        19,1,0,0,0,423,424,5,132,0,0,424,425,5,139,0,0,425,426,5,123,0,0,
        426,427,5,139,0,0,427,429,5,64,0,0,428,430,5,139,0,0,429,428,1,0,
        0,0,429,430,1,0,0,0,430,431,1,0,0,0,431,432,3,14,7,0,432,433,5,139,
        0,0,433,434,5,47,0,0,434,435,5,139,0,0,435,446,3,128,64,0,436,438,
        5,139,0,0,437,436,1,0,0,0,437,438,1,0,0,0,438,439,1,0,0,0,439,441,
        5,4,0,0,440,442,5,139,0,0,441,440,1,0,0,0,441,442,1,0,0,0,442,443,
        1,0,0,0,443,445,3,128,64,0,444,437,1,0,0,0,445,448,1,0,0,0,446,444,
        1,0,0,0,446,447,1,0,0,0,447,451,1,0,0,0,448,446,1,0,0,0,449,450,
        5,139,0,0,450,452,3,22,11,0,451,449,1,0,0,0,451,452,1,0,0,0,452,
        21,1,0,0,0,453,454,5,94,0,0,454,455,5,139,0,0,455,462,5,127,0,0,
        456,457,5,94,0,0,457,458,5,139,0,0,458,459,5,89,0,0,459,460,5,139,
        0,0,460,462,5,95,0,0,461,453,1,0,0,0,461,456,1,0,0,0,462,23,1,0,
        0,0,463,470,3,28,14,0,464,466,5,139,0,0,465,464,1,0,0,0,465,466,
        1,0,0,0,466,467,1,0,0,0,467,469,3,26,13,0,468,465,1,0,0,0,469,472,
        1,0,0,0,470,468,1,0,0,0,470,471,1,0,0,0,471,25,1,0,0,0,472,470,1,
        0,0,0,473,474,5,51,0,0,474,475,5,139,0,0,475,477,5,52,0,0,476,478,
        5,139,0,0,477,476,1,0,0,0,477,478,1,0,0,0,478,479,1,0,0,0,479,486,
        3,28,14,0,480,482,5,51,0,0,481,483,5,139,0,0,482,481,1,0,0,0,482,
        483,1,0,0,0,483,484,1,0,0,0,484,486,3,28,14,0,485,473,1,0,0,0,485,
        480,1,0,0,0,486,27,1,0,0,0,487,490,3,30,15,0,488,490,3,32,16,0,489,
        487,1,0,0,0,489,488,1,0,0,0,490,29,1,0,0,0,491,493,3,36,18,0,492,
        494,5,139,0,0,493,492,1,0,0,0,493,494,1,0,0,0,494,496,1,0,0,0,495,
        491,1,0,0,0,496,499,1,0,0,0,497,495,1,0,0,0,497,498,1,0,0,0,498,
        500,1,0,0,0,499,497,1,0,0,0,500,527,3,74,37,0,501,503,3,36,18,0,
        502,504,5,139,0,0,503,502,1,0,0,0,503,504,1,0,0,0,504,506,1,0,0,
        0,505,501,1,0,0,0,506,509,1,0,0,0,507,505,1,0,0,0,507,508,1,0,0,
        0,508,510,1,0,0,0,509,507,1,0,0,0,510,517,3,34,17,0,511,513,5,139,
        0,0,512,511,1,0,0,0,512,513,1,0,0,0,513,514,1,0,0,0,514,516,3,34,
        17,0,515,512,1,0,0,0,516,519,1,0,0,0,517,515,1,0,0,0,517,518,1,0,
        0,0,518,524,1,0,0,0,519,517,1,0,0,0,520,522,5,139,0,0,521,520,1,
        0,0,0,521,522,1,0,0,0,522,523,1,0,0,0,523,525,3,74,37,0,524,521,
        1,0,0,0,524,525,1,0,0,0,525,527,1,0,0,0,526,497,1,0,0,0,526,507,
        1,0,0,0,527,31,1,0,0,0,528,530,3,36,18,0,529,531,5,139,0,0,530,529,
        1,0,0,0,530,531,1,0,0,0,531,533,1,0,0,0,532,528,1,0,0,0,533,536,
        1,0,0,0,534,532,1,0,0,0,534,535,1,0,0,0,535,543,1,0,0,0,536,534,
        1,0,0,0,537,539,3,34,17,0,538,540,5,139,0,0,539,538,1,0,0,0,539,
        540,1,0,0,0,540,542,1,0,0,0,541,537,1,0,0,0,542,545,1,0,0,0,543,
        541,1,0,0,0,543,544,1,0,0,0,544,546,1,0,0,0,545,543,1,0,0,0,546,
        548,3,72,36,0,547,549,5,139,0,0,548,547,1,0,0,0,548,549,1,0,0,0,
        549,551,1,0,0,0,550,534,1,0,0,0,551,552,1,0,0,0,552,550,1,0,0,0,
        552,553,1,0,0,0,553,554,1,0,0,0,554,555,3,30,15,0,555,33,1,0,0,0,
        556,564,3,52,26,0,557,564,3,48,24,0,558,564,3,58,29,0,559,564,3,
        54,27,0,560,564,3,60,30,0,561,564,3,40,20,0,562,564,3,42,21,0,563,
        556,1,0,0,0,563,557,1,0,0,0,563,558,1,0,0,0,563,559,1,0,0,0,563,
        560,1,0,0,0,563,561,1,0,0,0,563,562,1,0,0,0,564,35,1,0,0,0,565,571,
        3,44,22,0,566,571,3,46,23,0,567,571,3,64,32,0,568,571,3,42,21,0,
        569,571,3,38,19,0,570,565,1,0,0,0,570,566,1,0,0,0,570,567,1,0,0,
        0,570,568,1,0,0,0,570,569,1,0,0,0,571,37,1,0,0,0,572,573,5,53,0,
        0,573,574,5,139,0,0,574,579,5,54,0,0,575,576,5,139,0,0,576,577,5,
        72,0,0,577,578,5,139,0,0,578,580,5,55,0,0,579,575,1,0,0,0,579,580,
        1,0,0,0,580,581,1,0,0,0,581,582,5,139,0,0,582,583,5,56,0,0,583,584,
        5,139,0,0,584,585,3,128,64,0,585,586,5,139,0,0,586,587,5,62,0,0,
        587,588,5,139,0,0,588,593,3,202,101,0,589,590,5,139,0,0,590,591,
        5,57,0,0,591,592,5,139,0,0,592,594,5,121,0,0,593,589,1,0,0,0,593,
        594,1,0,0,0,594,39,1,0,0,0,595,597,5,58,0,0,596,598,5,139,0,0,597,
        596,1,0,0,0,597,598,1,0,0,0,598,599,1,0,0,0,599,601,5,3,0,0,600,
        602,5,139,0,0,601,600,1,0,0,0,601,602,1,0,0,0,602,603,1,0,0,0,603,
        604,3,202,101,0,604,605,5,139,0,0,605,606,5,93,0,0,606,607,5,139,
        0,0,607,609,3,128,64,0,608,610,5,139,0,0,609,608,1,0,0,0,609,610,
        1,0,0,0,610,611,1,0,0,0,611,616,5,6,0,0,612,614,5,139,0,0,613,612,
        1,0,0,0,613,614,1,0,0,0,614,615,1,0,0,0,615,617,3,34,17,0,616,613,
        1,0,0,0,617,618,1,0,0,0,618,616,1,0,0,0,618,619,1,0,0,0,619,621,
        1,0,0,0,620,622,5,139,0,0,621,620,1,0,0,0,621,622,1,0,0,0,622,623,
        1,0,0,0,623,624,5,5,0,0,624,41,1,0,0,0,625,627,5,70,0,0,626,628,
        5,139,0,0,627,626,1,0,0,0,627,628,1,0,0,0,628,629,1,0,0,0,629,631,
        5,7,0,0,630,632,5,139,0,0,631,630,1,0,0,0,631,632,1,0,0,0,632,633,
        1,0,0,0,633,635,3,24,12,0,634,636,5,139,0,0,635,634,1,0,0,0,635,
        636,1,0,0,0,636,637,1,0,0,0,637,638,5,8,0,0,638,43,1,0,0,0,639,640,
        5,59,0,0,640,642,5,139,0,0,641,639,1,0,0,0,641,642,1,0,0,0,642,643,
        1,0,0,0,643,645,5,60,0,0,644,646,5,139,0,0,645,644,1,0,0,0,645,646,
        1,0,0,0,646,647,1,0,0,0,647,652,3,92,46,0,648,650,5,139,0,0,649,
        648,1,0,0,0,649,650,1,0,0,0,650,651,1,0,0,0,651,653,3,90,45,0,652,
        649,1,0,0,0,652,653,1,0,0,0,653,45,1,0,0,0,654,656,5,61,0,0,655,
        657,5,139,0,0,656,655,1,0,0,0,656,657,1,0,0,0,657,658,1,0,0,0,658,
        659,3,128,64,0,659,660,5,139,0,0,660,661,5,62,0,0,661,662,5,139,
        0,0,662,663,3,202,101,0,663,47,1,0,0,0,664,666,5,63,0,0,665,667,
        5,139,0,0,666,665,1,0,0,0,666,667,1,0,0,0,667,668,1,0,0,0,668,673,
        3,94,47,0,669,670,5,139,0,0,670,672,3,50,25,0,671,669,1,0,0,0,672,
        675,1,0,0,0,673,671,1,0,0,0,673,674,1,0,0,0,674,49,1,0,0,0,675,673,
        1,0,0,0,676,677,5,64,0,0,677,678,5,139,0,0,678,679,5,60,0,0,679,
        680,5,139,0,0,680,687,3,54,27,0,681,682,5,64,0,0,682,683,5,139,0,
        0,683,684,5,65,0,0,684,685,5,139,0,0,685,687,3,54,27,0,686,676,1,
        0,0,0,686,681,1,0,0,0,687,51,1,0,0,0,688,690,5,65,0,0,689,691,5,
        139,0,0,690,689,1,0,0,0,690,691,1,0,0,0,691,692,1,0,0,0,692,693,
        3,92,46,0,693,53,1,0,0,0,694,696,5,66,0,0,695,697,5,139,0,0,696,
        695,1,0,0,0,696,697,1,0,0,0,697,698,1,0,0,0,698,709,3,56,28,0,699,
        701,5,139,0,0,700,699,1,0,0,0,700,701,1,0,0,0,701,702,1,0,0,0,702,
        704,5,4,0,0,703,705,5,139,0,0,704,703,1,0,0,0,704,705,1,0,0,0,705,
        706,1,0,0,0,706,708,3,56,28,0,707,700,1,0,0,0,708,711,1,0,0,0,709,
        707,1,0,0,0,709,710,1,0,0,0,710,55,1,0,0,0,711,709,1,0,0,0,712,714,
        3,126,63,0,713,715,5,139,0,0,714,713,1,0,0,0,714,715,1,0,0,0,715,
        716,1,0,0,0,716,718,5,9,0,0,717,719,5,139,0,0,718,717,1,0,0,0,718,
        719,1,0,0,0,719,720,1,0,0,0,720,721,3,128,64,0,721,749,1,0,0,0,722,
        724,3,202,101,0,723,725,5,139,0,0,724,723,1,0,0,0,724,725,1,0,0,
        0,725,726,1,0,0,0,726,728,5,9,0,0,727,729,5,139,0,0,728,727,1,0,
        0,0,728,729,1,0,0,0,729,730,1,0,0,0,730,731,3,128,64,0,731,749,1,
        0,0,0,732,734,3,202,101,0,733,735,5,139,0,0,734,733,1,0,0,0,734,
        735,1,0,0,0,735,736,1,0,0,0,736,738,5,10,0,0,737,739,5,139,0,0,738,
        737,1,0,0,0,738,739,1,0,0,0,739,740,1,0,0,0,740,741,3,128,64,0,741,
        749,1,0,0,0,742,744,3,202,101,0,743,745,5,139,0,0,744,743,1,0,0,
        0,744,745,1,0,0,0,745,746,1,0,0,0,746,747,3,116,58,0,747,749,1,0,
        0,0,748,712,1,0,0,0,748,722,1,0,0,0,748,732,1,0,0,0,748,742,1,0,
        0,0,749,57,1,0,0,0,750,751,5,67,0,0,751,753,5,139,0,0,752,750,1,
        0,0,0,752,753,1,0,0,0,753,754,1,0,0,0,754,756,5,68,0,0,755,757,5,
        139,0,0,756,755,1,0,0,0,756,757,1,0,0,0,757,758,1,0,0,0,758,769,
        3,128,64,0,759,761,5,139,0,0,760,759,1,0,0,0,760,761,1,0,0,0,761,
        762,1,0,0,0,762,764,5,4,0,0,763,765,5,139,0,0,764,763,1,0,0,0,764,
        765,1,0,0,0,765,766,1,0,0,0,766,768,3,128,64,0,767,760,1,0,0,0,768,
        771,1,0,0,0,769,767,1,0,0,0,769,770,1,0,0,0,770,59,1,0,0,0,771,769,
        1,0,0,0,772,773,5,69,0,0,773,774,5,139,0,0,774,785,3,62,31,0,775,
        777,5,139,0,0,776,775,1,0,0,0,776,777,1,0,0,0,777,778,1,0,0,0,778,
        780,5,4,0,0,779,781,5,139,0,0,780,779,1,0,0,0,780,781,1,0,0,0,781,
        782,1,0,0,0,782,784,3,62,31,0,783,776,1,0,0,0,784,787,1,0,0,0,785,
        783,1,0,0,0,785,786,1,0,0,0,786,61,1,0,0,0,787,785,1,0,0,0,788,789,
        3,202,101,0,789,790,3,116,58,0,790,793,1,0,0,0,791,793,3,126,63,
        0,792,788,1,0,0,0,792,791,1,0,0,0,793,63,1,0,0,0,794,795,5,70,0,
        0,795,796,5,139,0,0,796,803,3,192,96,0,797,799,5,139,0,0,798,797,
        1,0,0,0,798,799,1,0,0,0,799,800,1,0,0,0,800,801,5,71,0,0,801,802,
        5,139,0,0,802,804,3,68,34,0,803,798,1,0,0,0,803,804,1,0,0,0,804,
        65,1,0,0,0,805,806,5,70,0,0,806,809,5,139,0,0,807,810,3,192,96,0,
        808,810,3,194,97,0,809,807,1,0,0,0,809,808,1,0,0,0,810,820,1,0,0,
        0,811,813,5,139,0,0,812,811,1,0,0,0,812,813,1,0,0,0,813,814,1,0,
        0,0,814,815,5,71,0,0,815,818,5,139,0,0,816,819,5,11,0,0,817,819,
        3,68,34,0,818,816,1,0,0,0,818,817,1,0,0,0,819,821,1,0,0,0,820,812,
        1,0,0,0,820,821,1,0,0,0,821,67,1,0,0,0,822,833,3,70,35,0,823,825,
        5,139,0,0,824,823,1,0,0,0,824,825,1,0,0,0,825,826,1,0,0,0,826,828,
        5,4,0,0,827,829,5,139,0,0,828,827,1,0,0,0,828,829,1,0,0,0,829,830,
        1,0,0,0,830,832,3,70,35,0,831,824,1,0,0,0,832,835,1,0,0,0,833,831,
        1,0,0,0,833,834,1,0,0,0,834,840,1,0,0,0,835,833,1,0,0,0,836,838,
        5,139,0,0,837,836,1,0,0,0,837,838,1,0,0,0,838,839,1,0,0,0,839,841,
        3,90,45,0,840,837,1,0,0,0,840,841,1,0,0,0,841,69,1,0,0,0,842,843,
        3,196,98,0,843,844,5,139,0,0,844,845,5,62,0,0,845,846,5,139,0,0,
        846,848,1,0,0,0,847,842,1,0,0,0,847,848,1,0,0,0,848,849,1,0,0,0,
        849,850,3,202,101,0,850,71,1,0,0,0,851,852,5,72,0,0,852,857,3,76,
        38,0,853,855,5,139,0,0,854,853,1,0,0,0,854,855,1,0,0,0,855,856,1,
        0,0,0,856,858,3,90,45,0,857,854,1,0,0,0,857,858,1,0,0,0,858,73,1,
        0,0,0,859,860,5,73,0,0,860,861,3,76,38,0,861,75,1,0,0,0,862,864,
        5,139,0,0,863,862,1,0,0,0,863,864,1,0,0,0,864,865,1,0,0,0,865,867,
        5,74,0,0,866,863,1,0,0,0,866,867,1,0,0,0,867,868,1,0,0,0,868,869,
        5,139,0,0,869,872,3,78,39,0,870,871,5,139,0,0,871,873,3,82,41,0,
        872,870,1,0,0,0,872,873,1,0,0,0,873,876,1,0,0,0,874,875,5,139,0,
        0,875,877,3,84,42,0,876,874,1,0,0,0,876,877,1,0,0,0,877,880,1,0,
        0,0,878,879,5,139,0,0,879,881,3,86,43,0,880,878,1,0,0,0,880,881,
        1,0,0,0,881,77,1,0,0,0,882,893,5,11,0,0,883,885,5,139,0,0,884,883,
        1,0,0,0,884,885,1,0,0,0,885,886,1,0,0,0,886,888,5,4,0,0,887,889,
        5,139,0,0,888,887,1,0,0,0,888,889,1,0,0,0,889,890,1,0,0,0,890,892,
        3,80,40,0,891,884,1,0,0,0,892,895,1,0,0,0,893,891,1,0,0,0,893,894,
        1,0,0,0,894,911,1,0,0,0,895,893,1,0,0,0,896,907,3,80,40,0,897,899,
        5,139,0,0,898,897,1,0,0,0,898,899,1,0,0,0,899,900,1,0,0,0,900,902,
        5,4,0,0,901,903,5,139,0,0,902,901,1,0,0,0,902,903,1,0,0,0,903,904,
        1,0,0,0,904,906,3,80,40,0,905,898,1,0,0,0,906,909,1,0,0,0,907,905,
        1,0,0,0,907,908,1,0,0,0,908,911,1,0,0,0,909,907,1,0,0,0,910,882,
        1,0,0,0,910,896,1,0,0,0,911,79,1,0,0,0,912,913,3,128,64,0,913,914,
        5,139,0,0,914,915,5,62,0,0,915,916,5,139,0,0,916,917,3,202,101,0,
        917,920,1,0,0,0,918,920,3,128,64,0,919,912,1,0,0,0,919,918,1,0,0,
        0,920,81,1,0,0,0,921,922,5,75,0,0,922,923,5,139,0,0,923,924,5,76,
        0,0,924,925,5,139,0,0,925,933,3,88,44,0,926,928,5,4,0,0,927,929,
        5,139,0,0,928,927,1,0,0,0,928,929,1,0,0,0,929,930,1,0,0,0,930,932,
        3,88,44,0,931,926,1,0,0,0,932,935,1,0,0,0,933,931,1,0,0,0,933,934,
        1,0,0,0,934,83,1,0,0,0,935,933,1,0,0,0,936,937,5,77,0,0,937,938,
        5,139,0,0,938,939,3,128,64,0,939,85,1,0,0,0,940,941,5,78,0,0,941,
        942,5,139,0,0,942,943,3,128,64,0,943,87,1,0,0,0,944,949,3,128,64,
        0,945,947,5,139,0,0,946,945,1,0,0,0,946,947,1,0,0,0,947,948,1,0,
        0,0,948,950,7,1,0,0,949,946,1,0,0,0,949,950,1,0,0,0,950,89,1,0,0,
        0,951,952,5,83,0,0,952,953,5,139,0,0,953,954,3,128,64,0,954,91,1,
        0,0,0,955,966,3,94,47,0,956,958,5,139,0,0,957,956,1,0,0,0,957,958,
        1,0,0,0,958,959,1,0,0,0,959,961,5,4,0,0,960,962,5,139,0,0,961,960,
        1,0,0,0,961,962,1,0,0,0,962,963,1,0,0,0,963,965,3,94,47,0,964,957,
        1,0,0,0,965,968,1,0,0,0,966,964,1,0,0,0,966,967,1,0,0,0,967,93,1,
        0,0,0,968,966,1,0,0,0,969,971,3,202,101,0,970,972,5,139,0,0,971,
        970,1,0,0,0,971,972,1,0,0,0,972,973,1,0,0,0,973,975,5,9,0,0,974,
        976,5,139,0,0,975,974,1,0,0,0,975,976,1,0,0,0,976,977,1,0,0,0,977,
        978,3,96,48,0,978,981,1,0,0,0,979,981,3,96,48,0,980,969,1,0,0,0,
        980,979,1,0,0,0,981,95,1,0,0,0,982,985,3,98,49,0,983,985,3,100,50,
        0,984,982,1,0,0,0,984,983,1,0,0,0,985,97,1,0,0,0,986,988,7,2,0,0,
        987,989,5,139,0,0,988,987,1,0,0,0,988,989,1,0,0,0,989,990,1,0,0,
        0,990,992,5,3,0,0,991,993,5,139,0,0,992,991,1,0,0,0,992,993,1,0,
        0,0,993,994,1,0,0,0,994,996,3,100,50,0,995,997,5,139,0,0,996,995,
        1,0,0,0,996,997,1,0,0,0,997,998,1,0,0,0,998,999,5,5,0,0,999,99,1,
        0,0,0,1000,1007,3,104,52,0,1001,1003,5,139,0,0,1002,1001,1,0,0,0,
        1002,1003,1,0,0,0,1003,1004,1,0,0,0,1004,1006,3,106,53,0,1005,1002,
        1,0,0,0,1006,1009,1,0,0,0,1007,1005,1,0,0,0,1007,1008,1,0,0,0,1008,
        1015,1,0,0,0,1009,1007,1,0,0,0,1010,1011,5,3,0,0,1011,1012,3,100,
        50,0,1012,1013,5,5,0,0,1013,1015,1,0,0,0,1014,1000,1,0,0,0,1014,
        1010,1,0,0,0,1015,101,1,0,0,0,1016,1021,3,104,52,0,1017,1019,5,139,
        0,0,1018,1017,1,0,0,0,1018,1019,1,0,0,0,1019,1020,1,0,0,0,1020,1022,
        3,106,53,0,1021,1018,1,0,0,0,1022,1023,1,0,0,0,1023,1021,1,0,0,0,
        1023,1024,1,0,0,0,1024,103,1,0,0,0,1025,1027,5,3,0,0,1026,1028,5,
        139,0,0,1027,1026,1,0,0,0,1027,1028,1,0,0,0,1028,1033,1,0,0,0,1029,
        1031,3,202,101,0,1030,1032,5,139,0,0,1031,1030,1,0,0,0,1031,1032,
        1,0,0,0,1032,1034,1,0,0,0,1033,1029,1,0,0,0,1033,1034,1,0,0,0,1034,
        1039,1,0,0,0,1035,1037,3,116,58,0,1036,1038,5,139,0,0,1037,1036,
        1,0,0,0,1037,1038,1,0,0,0,1038,1040,1,0,0,0,1039,1035,1,0,0,0,1039,
        1040,1,0,0,0,1040,1045,1,0,0,0,1041,1043,3,112,56,0,1042,1044,5,
        139,0,0,1043,1042,1,0,0,0,1043,1044,1,0,0,0,1044,1046,1,0,0,0,1045,
        1041,1,0,0,0,1045,1046,1,0,0,0,1046,1047,1,0,0,0,1047,1048,5,5,0,
        0,1048,105,1,0,0,0,1049,1051,3,108,54,0,1050,1052,5,139,0,0,1051,
        1050,1,0,0,0,1051,1052,1,0,0,0,1052,1053,1,0,0,0,1053,1054,3,104,
        52,0,1054,107,1,0,0,0,1055,1057,3,228,114,0,1056,1058,5,139,0,0,
        1057,1056,1,0,0,0,1057,1058,1,0,0,0,1058,1059,1,0,0,0,1059,1061,
        3,232,116,0,1060,1062,5,139,0,0,1061,1060,1,0,0,0,1061,1062,1,0,
        0,0,1062,1064,1,0,0,0,1063,1065,3,110,55,0,1064,1063,1,0,0,0,1064,
        1065,1,0,0,0,1065,1067,1,0,0,0,1066,1068,5,139,0,0,1067,1066,1,0,
        0,0,1067,1068,1,0,0,0,1068,1069,1,0,0,0,1069,1071,3,232,116,0,1070,
        1072,5,139,0,0,1071,1070,1,0,0,0,1071,1072,1,0,0,0,1072,1073,1,0,
        0,0,1073,1074,3,230,115,0,1074,1120,1,0,0,0,1075,1077,3,228,114,
        0,1076,1078,5,139,0,0,1077,1076,1,0,0,0,1077,1078,1,0,0,0,1078,1079,
        1,0,0,0,1079,1081,3,232,116,0,1080,1082,5,139,0,0,1081,1080,1,0,
        0,0,1081,1082,1,0,0,0,1082,1084,1,0,0,0,1083,1085,3,110,55,0,1084,
        1083,1,0,0,0,1084,1085,1,0,0,0,1085,1087,1,0,0,0,1086,1088,5,139,
        0,0,1087,1086,1,0,0,0,1087,1088,1,0,0,0,1088,1089,1,0,0,0,1089,1090,
        3,232,116,0,1090,1120,1,0,0,0,1091,1093,3,232,116,0,1092,1094,5,
        139,0,0,1093,1092,1,0,0,0,1093,1094,1,0,0,0,1094,1096,1,0,0,0,1095,
        1097,3,110,55,0,1096,1095,1,0,0,0,1096,1097,1,0,0,0,1097,1099,1,
        0,0,0,1098,1100,5,139,0,0,1099,1098,1,0,0,0,1099,1100,1,0,0,0,1100,
        1101,1,0,0,0,1101,1103,3,232,116,0,1102,1104,5,139,0,0,1103,1102,
        1,0,0,0,1103,1104,1,0,0,0,1104,1105,1,0,0,0,1105,1106,3,230,115,
        0,1106,1120,1,0,0,0,1107,1109,3,232,116,0,1108,1110,5,139,0,0,1109,
        1108,1,0,0,0,1109,1110,1,0,0,0,1110,1112,1,0,0,0,1111,1113,3,110,
        55,0,1112,1111,1,0,0,0,1112,1113,1,0,0,0,1113,1115,1,0,0,0,1114,
        1116,5,139,0,0,1115,1114,1,0,0,0,1115,1116,1,0,0,0,1116,1117,1,0,
        0,0,1117,1118,3,232,116,0,1118,1120,1,0,0,0,1119,1055,1,0,0,0,1119,
        1075,1,0,0,0,1119,1091,1,0,0,0,1119,1107,1,0,0,0,1120,109,1,0,0,
        0,1121,1123,5,12,0,0,1122,1124,5,139,0,0,1123,1122,1,0,0,0,1123,
        1124,1,0,0,0,1124,1129,1,0,0,0,1125,1127,3,202,101,0,1126,1128,5,
        139,0,0,1127,1126,1,0,0,0,1127,1128,1,0,0,0,1128,1130,1,0,0,0,1129,
        1125,1,0,0,0,1129,1130,1,0,0,0,1130,1135,1,0,0,0,1131,1133,3,114,
        57,0,1132,1134,5,139,0,0,1133,1132,1,0,0,0,1133,1134,1,0,0,0,1134,
        1136,1,0,0,0,1135,1131,1,0,0,0,1135,1136,1,0,0,0,1136,1138,1,0,0,
        0,1137,1139,3,120,60,0,1138,1137,1,0,0,0,1138,1139,1,0,0,0,1139,
        1144,1,0,0,0,1140,1142,3,112,56,0,1141,1143,5,139,0,0,1142,1141,
        1,0,0,0,1142,1143,1,0,0,0,1143,1145,1,0,0,0,1144,1140,1,0,0,0,1144,
        1145,1,0,0,0,1145,1146,1,0,0,0,1146,1147,5,13,0,0,1147,111,1,0,0,
        0,1148,1151,3,216,108,0,1149,1151,3,220,110,0,1150,1148,1,0,0,0,
        1150,1149,1,0,0,0,1151,113,1,0,0,0,1152,1154,5,2,0,0,1153,1155,5,
        139,0,0,1154,1153,1,0,0,0,1154,1155,1,0,0,0,1155,1156,1,0,0,0,1156,
        1170,3,124,62,0,1157,1159,5,139,0,0,1158,1157,1,0,0,0,1158,1159,
        1,0,0,0,1159,1160,1,0,0,0,1160,1162,5,6,0,0,1161,1163,5,2,0,0,1162,
        1161,1,0,0,0,1162,1163,1,0,0,0,1163,1165,1,0,0,0,1164,1166,5,139,
        0,0,1165,1164,1,0,0,0,1165,1166,1,0,0,0,1166,1167,1,0,0,0,1167,1169,
        3,124,62,0,1168,1158,1,0,0,0,1169,1172,1,0,0,0,1170,1168,1,0,0,0,
        1170,1171,1,0,0,0,1171,115,1,0,0,0,1172,1170,1,0,0,0,1173,1180,3,
        118,59,0,1174,1176,5,139,0,0,1175,1174,1,0,0,0,1175,1176,1,0,0,0,
        1176,1177,1,0,0,0,1177,1179,3,118,59,0,1178,1175,1,0,0,0,1179,1182,
        1,0,0,0,1180,1178,1,0,0,0,1180,1181,1,0,0,0,1181,117,1,0,0,0,1182,
        1180,1,0,0,0,1183,1185,5,2,0,0,1184,1186,5,139,0,0,1185,1184,1,0,
        0,0,1185,1186,1,0,0,0,1186,1187,1,0,0,0,1187,1188,3,122,61,0,1188,
        119,1,0,0,0,1189,1191,5,11,0,0,1190,1192,5,139,0,0,1191,1190,1,0,
        0,0,1191,1192,1,0,0,0,1192,1197,1,0,0,0,1193,1195,3,210,105,0,1194,
        1196,5,139,0,0,1195,1194,1,0,0,0,1195,1196,1,0,0,0,1196,1198,1,0,
        0,0,1197,1193,1,0,0,0,1197,1198,1,0,0,0,1198,1209,1,0,0,0,1199,1201,
        5,14,0,0,1200,1202,5,139,0,0,1201,1200,1,0,0,0,1201,1202,1,0,0,0,
        1202,1207,1,0,0,0,1203,1205,3,210,105,0,1204,1206,5,139,0,0,1205,
        1204,1,0,0,0,1205,1206,1,0,0,0,1206,1208,1,0,0,0,1207,1203,1,0,0,
        0,1207,1208,1,0,0,0,1208,1210,1,0,0,0,1209,1199,1,0,0,0,1209,1210,
        1,0,0,0,1210,121,1,0,0,0,1211,1212,3,222,111,0,1212,123,1,0,0,0,
        1213,1214,3,222,111,0,1214,125,1,0,0,0,1215,1220,3,164,82,0,1216,
        1218,5,139,0,0,1217,1216,1,0,0,0,1217,1218,1,0,0,0,1218,1219,1,0,
        0,0,1219,1221,3,162,81,0,1220,1217,1,0,0,0,1221,1222,1,0,0,0,1222,
        1220,1,0,0,0,1222,1223,1,0,0,0,1223,127,1,0,0,0,1224,1225,3,130,
        65,0,1225,129,1,0,0,0,1226,1233,3,132,66,0,1227,1228,5,139,0,0,1228,
        1229,5,86,0,0,1229,1230,5,139,0,0,1230,1232,3,132,66,0,1231,1227,
        1,0,0,0,1232,1235,1,0,0,0,1233,1231,1,0,0,0,1233,1234,1,0,0,0,1234,
        131,1,0,0,0,1235,1233,1,0,0,0,1236,1243,3,134,67,0,1237,1238,5,139,
        0,0,1238,1239,5,87,0,0,1239,1240,5,139,0,0,1240,1242,3,134,67,0,
        1241,1237,1,0,0,0,1242,1245,1,0,0,0,1243,1241,1,0,0,0,1243,1244,
        1,0,0,0,1244,133,1,0,0,0,1245,1243,1,0,0,0,1246,1253,3,136,68,0,
        1247,1248,5,139,0,0,1248,1249,5,88,0,0,1249,1250,5,139,0,0,1250,
        1252,3,136,68,0,1251,1247,1,0,0,0,1252,1255,1,0,0,0,1253,1251,1,
        0,0,0,1253,1254,1,0,0,0,1254,135,1,0,0,0,1255,1253,1,0,0,0,1256,
        1258,5,89,0,0,1257,1259,5,139,0,0,1258,1257,1,0,0,0,1258,1259,1,
        0,0,0,1259,1261,1,0,0,0,1260,1256,1,0,0,0,1261,1264,1,0,0,0,1262,
        1260,1,0,0,0,1262,1263,1,0,0,0,1263,1265,1,0,0,0,1264,1262,1,0,0,
        0,1265,1266,3,138,69,0,1266,137,1,0,0,0,1267,1274,3,142,71,0,1268,
        1270,5,139,0,0,1269,1268,1,0,0,0,1269,1270,1,0,0,0,1270,1271,1,0,
        0,0,1271,1273,3,140,70,0,1272,1269,1,0,0,0,1273,1276,1,0,0,0,1274,
        1272,1,0,0,0,1274,1275,1,0,0,0,1275,139,1,0,0,0,1276,1274,1,0,0,
        0,1277,1279,5,9,0,0,1278,1280,5,139,0,0,1279,1278,1,0,0,0,1279,1280,
        1,0,0,0,1280,1281,1,0,0,0,1281,1308,3,142,71,0,1282,1284,5,15,0,
        0,1283,1285,5,139,0,0,1284,1283,1,0,0,0,1284,1285,1,0,0,0,1285,1286,
        1,0,0,0,1286,1308,3,142,71,0,1287,1289,5,16,0,0,1288,1290,5,139,
        0,0,1289,1288,1,0,0,0,1289,1290,1,0,0,0,1290,1291,1,0,0,0,1291,1308,
        3,142,71,0,1292,1294,5,17,0,0,1293,1295,5,139,0,0,1294,1293,1,0,
        0,0,1294,1295,1,0,0,0,1295,1296,1,0,0,0,1296,1308,3,142,71,0,1297,
        1299,5,18,0,0,1298,1300,5,139,0,0,1299,1298,1,0,0,0,1299,1300,1,
        0,0,0,1300,1301,1,0,0,0,1301,1308,3,142,71,0,1302,1304,5,19,0,0,
        1303,1305,5,139,0,0,1304,1303,1,0,0,0,1304,1305,1,0,0,0,1305,1306,
        1,0,0,0,1306,1308,3,142,71,0,1307,1277,1,0,0,0,1307,1282,1,0,0,0,
        1307,1287,1,0,0,0,1307,1292,1,0,0,0,1307,1297,1,0,0,0,1307,1302,
        1,0,0,0,1308,141,1,0,0,0,1309,1315,3,150,75,0,1310,1314,3,144,72,
        0,1311,1314,3,146,73,0,1312,1314,3,148,74,0,1313,1310,1,0,0,0,1313,
        1311,1,0,0,0,1313,1312,1,0,0,0,1314,1317,1,0,0,0,1315,1313,1,0,0,
        0,1315,1316,1,0,0,0,1316,143,1,0,0,0,1317,1315,1,0,0,0,1318,1319,
        5,139,0,0,1319,1320,5,90,0,0,1320,1321,5,139,0,0,1321,1329,5,72,
        0,0,1322,1323,5,139,0,0,1323,1324,5,91,0,0,1324,1325,5,139,0,0,1325,
        1329,5,72,0,0,1326,1327,5,139,0,0,1327,1329,5,92,0,0,1328,1318,1,
        0,0,0,1328,1322,1,0,0,0,1328,1326,1,0,0,0,1329,1331,1,0,0,0,1330,
        1332,5,139,0,0,1331,1330,1,0,0,0,1331,1332,1,0,0,0,1332,1333,1,0,
        0,0,1333,1334,3,150,75,0,1334,145,1,0,0,0,1335,1336,5,139,0,0,1336,
        1338,5,93,0,0,1337,1339,5,139,0,0,1338,1337,1,0,0,0,1338,1339,1,
        0,0,0,1339,1340,1,0,0,0,1340,1341,3,150,75,0,1341,147,1,0,0,0,1342,
        1343,5,139,0,0,1343,1344,5,94,0,0,1344,1345,5,139,0,0,1345,1353,
        5,95,0,0,1346,1347,5,139,0,0,1347,1348,5,94,0,0,1348,1349,5,139,
        0,0,1349,1350,5,89,0,0,1350,1351,5,139,0,0,1351,1353,5,95,0,0,1352,
        1342,1,0,0,0,1352,1346,1,0,0,0,1353,149,1,0,0,0,1354,1373,3,152,
        76,0,1355,1357,5,139,0,0,1356,1355,1,0,0,0,1356,1357,1,0,0,0,1357,
        1358,1,0,0,0,1358,1360,5,20,0,0,1359,1361,5,139,0,0,1360,1359,1,
        0,0,0,1360,1361,1,0,0,0,1361,1362,1,0,0,0,1362,1372,3,152,76,0,1363,
        1365,5,139,0,0,1364,1363,1,0,0,0,1364,1365,1,0,0,0,1365,1366,1,0,
        0,0,1366,1368,5,21,0,0,1367,1369,5,139,0,0,1368,1367,1,0,0,0,1368,
        1369,1,0,0,0,1369,1370,1,0,0,0,1370,1372,3,152,76,0,1371,1356,1,
        0,0,0,1371,1364,1,0,0,0,1372,1375,1,0,0,0,1373,1371,1,0,0,0,1373,
        1374,1,0,0,0,1374,151,1,0,0,0,1375,1373,1,0,0,0,1376,1403,3,154,
        77,0,1377,1379,5,139,0,0,1378,1377,1,0,0,0,1378,1379,1,0,0,0,1379,
        1380,1,0,0,0,1380,1382,5,11,0,0,1381,1383,5,139,0,0,1382,1381,1,
        0,0,0,1382,1383,1,0,0,0,1383,1384,1,0,0,0,1384,1402,3,154,77,0,1385,
        1387,5,139,0,0,1386,1385,1,0,0,0,1386,1387,1,0,0,0,1387,1388,1,0,
        0,0,1388,1390,5,22,0,0,1389,1391,5,139,0,0,1390,1389,1,0,0,0,1390,
        1391,1,0,0,0,1391,1392,1,0,0,0,1392,1402,3,154,77,0,1393,1395,5,
        139,0,0,1394,1393,1,0,0,0,1394,1395,1,0,0,0,1395,1396,1,0,0,0,1396,
        1398,5,23,0,0,1397,1399,5,139,0,0,1398,1397,1,0,0,0,1398,1399,1,
        0,0,0,1399,1400,1,0,0,0,1400,1402,3,154,77,0,1401,1378,1,0,0,0,1401,
        1386,1,0,0,0,1401,1394,1,0,0,0,1402,1405,1,0,0,0,1403,1401,1,0,0,
        0,1403,1404,1,0,0,0,1404,153,1,0,0,0,1405,1403,1,0,0,0,1406,1417,
        3,156,78,0,1407,1409,5,139,0,0,1408,1407,1,0,0,0,1408,1409,1,0,0,
        0,1409,1410,1,0,0,0,1410,1412,5,24,0,0,1411,1413,5,139,0,0,1412,
        1411,1,0,0,0,1412,1413,1,0,0,0,1413,1414,1,0,0,0,1414,1416,3,156,
        78,0,1415,1408,1,0,0,0,1416,1419,1,0,0,0,1417,1415,1,0,0,0,1417,
        1418,1,0,0,0,1418,155,1,0,0,0,1419,1417,1,0,0,0,1420,1427,3,158,
        79,0,1421,1423,7,3,0,0,1422,1424,5,139,0,0,1423,1422,1,0,0,0,1423,
        1424,1,0,0,0,1424,1425,1,0,0,0,1425,1427,3,158,79,0,1426,1420,1,
        0,0,0,1426,1421,1,0,0,0,1427,157,1,0,0,0,1428,1439,3,164,82,0,1429,
        1431,5,139,0,0,1430,1429,1,0,0,0,1430,1431,1,0,0,0,1431,1432,1,0,
        0,0,1432,1438,3,160,80,0,1433,1435,5,139,0,0,1434,1433,1,0,0,0,1434,
        1435,1,0,0,0,1435,1436,1,0,0,0,1436,1438,3,162,81,0,1437,1430,1,
        0,0,0,1437,1434,1,0,0,0,1438,1441,1,0,0,0,1439,1437,1,0,0,0,1439,
        1440,1,0,0,0,1440,1446,1,0,0,0,1441,1439,1,0,0,0,1442,1444,5,139,
        0,0,1443,1442,1,0,0,0,1443,1444,1,0,0,0,1444,1445,1,0,0,0,1445,1447,
        3,116,58,0,1446,1443,1,0,0,0,1446,1447,1,0,0,0,1447,159,1,0,0,0,
        1448,1449,5,12,0,0,1449,1450,3,128,64,0,1450,1451,5,13,0,0,1451,
        1462,1,0,0,0,1452,1454,5,12,0,0,1453,1455,3,128,64,0,1454,1453,1,
        0,0,0,1454,1455,1,0,0,0,1455,1456,1,0,0,0,1456,1458,5,14,0,0,1457,
        1459,3,128,64,0,1458,1457,1,0,0,0,1458,1459,1,0,0,0,1459,1460,1,
        0,0,0,1460,1462,5,13,0,0,1461,1448,1,0,0,0,1461,1452,1,0,0,0,1462,
        161,1,0,0,0,1463,1465,5,25,0,0,1464,1466,5,139,0,0,1465,1464,1,0,
        0,0,1465,1466,1,0,0,0,1466,1467,1,0,0,0,1467,1468,3,218,109,0,1468,
        163,1,0,0,0,1469,1496,3,204,102,0,1470,1496,3,220,110,0,1471,1496,
        3,166,83,0,1472,1474,5,96,0,0,1473,1475,5,139,0,0,1474,1473,1,0,
        0,0,1474,1475,1,0,0,0,1475,1476,1,0,0,0,1476,1478,5,3,0,0,1477,1479,
        5,139,0,0,1478,1477,1,0,0,0,1478,1479,1,0,0,0,1479,1480,1,0,0,0,
        1480,1482,5,11,0,0,1481,1483,5,139,0,0,1482,1481,1,0,0,0,1482,1483,
        1,0,0,0,1483,1484,1,0,0,0,1484,1496,5,5,0,0,1485,1496,3,170,85,0,
        1486,1496,3,172,86,0,1487,1496,3,184,92,0,1488,1496,3,98,49,0,1489,
        1496,3,174,87,0,1490,1496,3,178,89,0,1491,1496,3,180,90,0,1492,1496,
        3,186,93,0,1493,1496,3,190,95,0,1494,1496,3,202,101,0,1495,1469,
        1,0,0,0,1495,1470,1,0,0,0,1495,1471,1,0,0,0,1495,1472,1,0,0,0,1495,
        1485,1,0,0,0,1495,1486,1,0,0,0,1495,1487,1,0,0,0,1495,1488,1,0,0,
        0,1495,1489,1,0,0,0,1495,1490,1,0,0,0,1495,1491,1,0,0,0,1495,1492,
        1,0,0,0,1495,1493,1,0,0,0,1495,1494,1,0,0,0,1496,165,1,0,0,0,1497,
        1502,5,97,0,0,1498,1500,5,139,0,0,1499,1498,1,0,0,0,1499,1500,1,
        0,0,0,1500,1501,1,0,0,0,1501,1503,3,168,84,0,1502,1499,1,0,0,0,1503,
        1504,1,0,0,0,1504,1502,1,0,0,0,1504,1505,1,0,0,0,1505,1520,1,0,0,
        0,1506,1508,5,97,0,0,1507,1509,5,139,0,0,1508,1507,1,0,0,0,1508,
        1509,1,0,0,0,1509,1510,1,0,0,0,1510,1515,3,128,64,0,1511,1513,5,
        139,0,0,1512,1511,1,0,0,0,1512,1513,1,0,0,0,1513,1514,1,0,0,0,1514,
        1516,3,168,84,0,1515,1512,1,0,0,0,1516,1517,1,0,0,0,1517,1515,1,
        0,0,0,1517,1518,1,0,0,0,1518,1520,1,0,0,0,1519,1497,1,0,0,0,1519,
        1506,1,0,0,0,1520,1529,1,0,0,0,1521,1523,5,139,0,0,1522,1521,1,0,
        0,0,1522,1523,1,0,0,0,1523,1524,1,0,0,0,1524,1526,5,98,0,0,1525,
        1527,5,139,0,0,1526,1525,1,0,0,0,1526,1527,1,0,0,0,1527,1528,1,0,
        0,0,1528,1530,3,128,64,0,1529,1522,1,0,0,0,1529,1530,1,0,0,0,1530,
        1532,1,0,0,0,1531,1533,5,139,0,0,1532,1531,1,0,0,0,1532,1533,1,0,
        0,0,1533,1534,1,0,0,0,1534,1535,5,99,0,0,1535,167,1,0,0,0,1536,1538,
        5,100,0,0,1537,1539,5,139,0,0,1538,1537,1,0,0,0,1538,1539,1,0,0,
        0,1539,1540,1,0,0,0,1540,1542,3,128,64,0,1541,1543,5,139,0,0,1542,
        1541,1,0,0,0,1542,1543,1,0,0,0,1543,1544,1,0,0,0,1544,1546,5,101,
        0,0,1545,1547,5,139,0,0,1546,1545,1,0,0,0,1546,1547,1,0,0,0,1547,
        1548,1,0,0,0,1548,1549,3,128,64,0,1549,169,1,0,0,0,1550,1552,5,12,
        0,0,1551,1553,5,139,0,0,1552,1551,1,0,0,0,1552,1553,1,0,0,0,1553,
        1554,1,0,0,0,1554,1563,3,176,88,0,1555,1557,5,139,0,0,1556,1555,
        1,0,0,0,1556,1557,1,0,0,0,1557,1558,1,0,0,0,1558,1560,5,6,0,0,1559,
        1561,5,139,0,0,1560,1559,1,0,0,0,1560,1561,1,0,0,0,1561,1562,1,0,
        0,0,1562,1564,3,128,64,0,1563,1556,1,0,0,0,1563,1564,1,0,0,0,1564,
        1566,1,0,0,0,1565,1567,5,139,0,0,1566,1565,1,0,0,0,1566,1567,1,0,
        0,0,1567,1568,1,0,0,0,1568,1569,5,13,0,0,1569,171,1,0,0,0,1570,1572,
        5,12,0,0,1571,1573,5,139,0,0,1572,1571,1,0,0,0,1572,1573,1,0,0,0,
        1573,1582,1,0,0,0,1574,1576,3,202,101,0,1575,1577,5,139,0,0,1576,
        1575,1,0,0,0,1576,1577,1,0,0,0,1577,1578,1,0,0,0,1578,1580,5,9,0,
        0,1579,1581,5,139,0,0,1580,1579,1,0,0,0,1580,1581,1,0,0,0,1581,1583,
        1,0,0,0,1582,1574,1,0,0,0,1582,1583,1,0,0,0,1583,1584,1,0,0,0,1584,
        1586,3,102,51,0,1585,1587,5,139,0,0,1586,1585,1,0,0,0,1586,1587,
        1,0,0,0,1587,1592,1,0,0,0,1588,1590,3,90,45,0,1589,1591,5,139,0,
        0,1590,1589,1,0,0,0,1590,1591,1,0,0,0,1591,1593,1,0,0,0,1592,1588,
        1,0,0,0,1592,1593,1,0,0,0,1593,1594,1,0,0,0,1594,1596,5,6,0,0,1595,
        1597,5,139,0,0,1596,1595,1,0,0,0,1596,1597,1,0,0,0,1597,1598,1,0,
        0,0,1598,1600,3,128,64,0,1599,1601,5,139,0,0,1600,1599,1,0,0,0,1600,
        1601,1,0,0,0,1601,1602,1,0,0,0,1602,1603,5,13,0,0,1603,173,1,0,0,
        0,1604,1606,5,52,0,0,1605,1607,5,139,0,0,1606,1605,1,0,0,0,1606,
        1607,1,0,0,0,1607,1608,1,0,0,0,1608,1610,5,3,0,0,1609,1611,5,139,
        0,0,1610,1609,1,0,0,0,1610,1611,1,0,0,0,1611,1612,1,0,0,0,1612,1614,
        3,176,88,0,1613,1615,5,139,0,0,1614,1613,1,0,0,0,1614,1615,1,0,0,
        0,1615,1616,1,0,0,0,1616,1617,5,5,0,0,1617,1661,1,0,0,0,1618,1620,
        5,102,0,0,1619,1621,5,139,0,0,1620,1619,1,0,0,0,1620,1621,1,0,0,
        0,1621,1622,1,0,0,0,1622,1624,5,3,0,0,1623,1625,5,139,0,0,1624,1623,
        1,0,0,0,1624,1625,1,0,0,0,1625,1626,1,0,0,0,1626,1628,3,176,88,0,
        1627,1629,5,139,0,0,1628,1627,1,0,0,0,1628,1629,1,0,0,0,1629,1630,
        1,0,0,0,1630,1631,5,5,0,0,1631,1661,1,0,0,0,1632,1634,5,103,0,0,
        1633,1635,5,139,0,0,1634,1633,1,0,0,0,1634,1635,1,0,0,0,1635,1636,
        1,0,0,0,1636,1638,5,3,0,0,1637,1639,5,139,0,0,1638,1637,1,0,0,0,
        1638,1639,1,0,0,0,1639,1640,1,0,0,0,1640,1642,3,176,88,0,1641,1643,
        5,139,0,0,1642,1641,1,0,0,0,1642,1643,1,0,0,0,1643,1644,1,0,0,0,
        1644,1645,5,5,0,0,1645,1661,1,0,0,0,1646,1648,5,104,0,0,1647,1649,
        5,139,0,0,1648,1647,1,0,0,0,1648,1649,1,0,0,0,1649,1650,1,0,0,0,
        1650,1652,5,3,0,0,1651,1653,5,139,0,0,1652,1651,1,0,0,0,1652,1653,
        1,0,0,0,1653,1654,1,0,0,0,1654,1656,3,176,88,0,1655,1657,5,139,0,
        0,1656,1655,1,0,0,0,1656,1657,1,0,0,0,1657,1658,1,0,0,0,1658,1659,
        5,5,0,0,1659,1661,1,0,0,0,1660,1604,1,0,0,0,1660,1618,1,0,0,0,1660,
        1632,1,0,0,0,1660,1646,1,0,0,0,1661,175,1,0,0,0,1662,1667,3,182,
        91,0,1663,1665,5,139,0,0,1664,1663,1,0,0,0,1664,1665,1,0,0,0,1665,
        1666,1,0,0,0,1666,1668,3,90,45,0,1667,1664,1,0,0,0,1667,1668,1,0,
        0,0,1668,177,1,0,0,0,1669,1670,3,102,51,0,1670,179,1,0,0,0,1671,
        1673,5,3,0,0,1672,1674,5,139,0,0,1673,1672,1,0,0,0,1673,1674,1,0,
        0,0,1674,1675,1,0,0,0,1675,1677,3,128,64,0,1676,1678,5,139,0,0,1677,
        1676,1,0,0,0,1677,1678,1,0,0,0,1678,1679,1,0,0,0,1679,1680,5,5,0,
        0,1680,181,1,0,0,0,1681,1682,3,202,101,0,1682,1683,5,139,0,0,1683,
        1684,5,93,0,0,1684,1685,5,139,0,0,1685,1686,3,128,64,0,1686,183,
        1,0,0,0,1687,1689,5,105,0,0,1688,1690,5,139,0,0,1689,1688,1,0,0,
        0,1689,1690,1,0,0,0,1690,1691,1,0,0,0,1691,1693,5,3,0,0,1692,1694,
        5,139,0,0,1693,1692,1,0,0,0,1693,1694,1,0,0,0,1694,1695,1,0,0,0,
        1695,1697,3,202,101,0,1696,1698,5,139,0,0,1697,1696,1,0,0,0,1697,
        1698,1,0,0,0,1698,1699,1,0,0,0,1699,1701,5,9,0,0,1700,1702,5,139,
        0,0,1701,1700,1,0,0,0,1701,1702,1,0,0,0,1702,1703,1,0,0,0,1703,1705,
        3,128,64,0,1704,1706,5,139,0,0,1705,1704,1,0,0,0,1705,1706,1,0,0,
        0,1706,1707,1,0,0,0,1707,1709,5,4,0,0,1708,1710,5,139,0,0,1709,1708,
        1,0,0,0,1709,1710,1,0,0,0,1710,1711,1,0,0,0,1711,1713,3,182,91,0,
        1712,1714,5,139,0,0,1713,1712,1,0,0,0,1713,1714,1,0,0,0,1714,1715,
        1,0,0,0,1715,1717,5,6,0,0,1716,1718,5,139,0,0,1717,1716,1,0,0,0,
        1717,1718,1,0,0,0,1718,1719,1,0,0,0,1719,1721,3,128,64,0,1720,1722,
        5,139,0,0,1721,1720,1,0,0,0,1721,1722,1,0,0,0,1722,1723,1,0,0,0,
        1723,1724,5,5,0,0,1724,185,1,0,0,0,1725,1727,3,188,94,0,1726,1728,
        5,139,0,0,1727,1726,1,0,0,0,1727,1728,1,0,0,0,1728,1729,1,0,0,0,
        1729,1731,5,3,0,0,1730,1732,5,139,0,0,1731,1730,1,0,0,0,1731,1732,
        1,0,0,0,1732,1737,1,0,0,0,1733,1735,5,74,0,0,1734,1736,5,139,0,0,
        1735,1734,1,0,0,0,1735,1736,1,0,0,0,1736,1738,1,0,0,0,1737,1733,
        1,0,0,0,1737,1738,1,0,0,0,1738,1756,1,0,0,0,1739,1741,3,128,64,0,
        1740,1742,5,139,0,0,1741,1740,1,0,0,0,1741,1742,1,0,0,0,1742,1753,
        1,0,0,0,1743,1745,5,4,0,0,1744,1746,5,139,0,0,1745,1744,1,0,0,0,
        1745,1746,1,0,0,0,1746,1747,1,0,0,0,1747,1749,3,128,64,0,1748,1750,
        5,139,0,0,1749,1748,1,0,0,0,1749,1750,1,0,0,0,1750,1752,1,0,0,0,
        1751,1743,1,0,0,0,1752,1755,1,0,0,0,1753,1751,1,0,0,0,1753,1754,
        1,0,0,0,1754,1757,1,0,0,0,1755,1753,1,0,0,0,1756,1739,1,0,0,0,1756,
        1757,1,0,0,0,1757,1758,1,0,0,0,1758,1759,5,5,0,0,1759,187,1,0,0,
        0,1760,1761,3,200,100,0,1761,1762,3,226,113,0,1762,189,1,0,0,0,1763,
        1765,5,106,0,0,1764,1766,5,139,0,0,1765,1764,1,0,0,0,1765,1766,1,
        0,0,0,1766,1767,1,0,0,0,1767,1769,5,7,0,0,1768,1770,5,139,0,0,1769,
        1768,1,0,0,0,1769,1770,1,0,0,0,1770,1787,1,0,0,0,1771,1788,3,24,
        12,0,1772,1774,3,36,18,0,1773,1775,5,139,0,0,1774,1773,1,0,0,0,1774,
        1775,1,0,0,0,1775,1777,1,0,0,0,1776,1772,1,0,0,0,1777,1778,1,0,0,
        0,1778,1776,1,0,0,0,1778,1779,1,0,0,0,1779,1788,1,0,0,0,1780,1785,
        3,92,46,0,1781,1783,5,139,0,0,1782,1781,1,0,0,0,1782,1783,1,0,0,
        0,1783,1784,1,0,0,0,1784,1786,3,90,45,0,1785,1782,1,0,0,0,1785,1786,
        1,0,0,0,1786,1788,1,0,0,0,1787,1771,1,0,0,0,1787,1776,1,0,0,0,1787,
        1780,1,0,0,0,1788,1790,1,0,0,0,1789,1791,5,139,0,0,1790,1789,1,0,
        0,0,1790,1791,1,0,0,0,1791,1792,1,0,0,0,1792,1793,5,8,0,0,1793,191,
        1,0,0,0,1794,1796,3,198,99,0,1795,1797,5,139,0,0,1796,1795,1,0,0,
        0,1796,1797,1,0,0,0,1797,1798,1,0,0,0,1798,1800,5,3,0,0,1799,1801,
        5,139,0,0,1800,1799,1,0,0,0,1800,1801,1,0,0,0,1801,1819,1,0,0,0,
        1802,1804,3,128,64,0,1803,1805,5,139,0,0,1804,1803,1,0,0,0,1804,
        1805,1,0,0,0,1805,1816,1,0,0,0,1806,1808,5,4,0,0,1807,1809,5,139,
        0,0,1808,1807,1,0,0,0,1808,1809,1,0,0,0,1809,1810,1,0,0,0,1810,1812,
        3,128,64,0,1811,1813,5,139,0,0,1812,1811,1,0,0,0,1812,1813,1,0,0,
        0,1813,1815,1,0,0,0,1814,1806,1,0,0,0,1815,1818,1,0,0,0,1816,1814,
        1,0,0,0,1816,1817,1,0,0,0,1817,1820,1,0,0,0,1818,1816,1,0,0,0,1819,
        1802,1,0,0,0,1819,1820,1,0,0,0,1820,1821,1,0,0,0,1821,1822,5,5,0,
        0,1822,193,1,0,0,0,1823,1824,3,198,99,0,1824,195,1,0,0,0,1825,1826,
        3,226,113,0,1826,197,1,0,0,0,1827,1828,3,200,100,0,1828,1829,3,226,
        113,0,1829,199,1,0,0,0,1830,1831,3,226,113,0,1831,1832,5,25,0,0,
        1832,1834,1,0,0,0,1833,1830,1,0,0,0,1834,1837,1,0,0,0,1835,1833,
        1,0,0,0,1835,1836,1,0,0,0,1836,201,1,0,0,0,1837,1835,1,0,0,0,1838,
        1839,3,226,113,0,1839,203,1,0,0,0,1840,1847,3,206,103,0,1841,1847,
        5,95,0,0,1842,1847,3,208,104,0,1843,1847,5,121,0,0,1844,1847,3,214,
        107,0,1845,1847,3,216,108,0,1846,1840,1,0,0,0,1846,1841,1,0,0,0,
        1846,1842,1,0,0,0,1846,1843,1,0,0,0,1846,1844,1,0,0,0,1846,1845,
        1,0,0,0,1847,205,1,0,0,0,1848,1849,7,4,0,0,1849,207,1,0,0,0,1850,
        1853,3,212,106,0,1851,1853,3,210,105,0,1852,1850,1,0,0,0,1852,1851,
        1,0,0,0,1853,209,1,0,0,0,1854,1855,7,5,0,0,1855,211,1,0,0,0,1856,
        1857,7,6,0,0,1857,213,1,0,0,0,1858,1860,5,12,0,0,1859,1861,5,139,
        0,0,1860,1859,1,0,0,0,1860,1861,1,0,0,0,1861,1879,1,0,0,0,1862,1864,
        3,128,64,0,1863,1865,5,139,0,0,1864,1863,1,0,0,0,1864,1865,1,0,0,
        0,1865,1876,1,0,0,0,1866,1868,5,4,0,0,1867,1869,5,139,0,0,1868,1867,
        1,0,0,0,1868,1869,1,0,0,0,1869,1870,1,0,0,0,1870,1872,3,128,64,0,
        1871,1873,5,139,0,0,1872,1871,1,0,0,0,1872,1873,1,0,0,0,1873,1875,
        1,0,0,0,1874,1866,1,0,0,0,1875,1878,1,0,0,0,1876,1874,1,0,0,0,1876,
        1877,1,0,0,0,1877,1880,1,0,0,0,1878,1876,1,0,0,0,1879,1862,1,0,0,
        0,1879,1880,1,0,0,0,1880,1881,1,0,0,0,1881,1882,5,13,0,0,1882,215,
        1,0,0,0,1883,1885,5,7,0,0,1884,1886,5,139,0,0,1885,1884,1,0,0,0,
        1885,1886,1,0,0,0,1886,1920,1,0,0,0,1887,1889,3,218,109,0,1888,1890,
        5,139,0,0,1889,1888,1,0,0,0,1889,1890,1,0,0,0,1890,1891,1,0,0,0,
        1891,1893,5,2,0,0,1892,1894,5,139,0,0,1893,1892,1,0,0,0,1893,1894,
        1,0,0,0,1894,1895,1,0,0,0,1895,1897,3,128,64,0,1896,1898,5,139,0,
        0,1897,1896,1,0,0,0,1897,1898,1,0,0,0,1898,1917,1,0,0,0,1899,1901,
        5,4,0,0,1900,1902,5,139,0,0,1901,1900,1,0,0,0,1901,1902,1,0,0,0,
        1902,1903,1,0,0,0,1903,1905,3,218,109,0,1904,1906,5,139,0,0,1905,
        1904,1,0,0,0,1905,1906,1,0,0,0,1906,1907,1,0,0,0,1907,1909,5,2,0,
        0,1908,1910,5,139,0,0,1909,1908,1,0,0,0,1909,1910,1,0,0,0,1910,1911,
        1,0,0,0,1911,1913,3,128,64,0,1912,1914,5,139,0,0,1913,1912,1,0,0,
        0,1913,1914,1,0,0,0,1914,1916,1,0,0,0,1915,1899,1,0,0,0,1916,1919,
        1,0,0,0,1917,1915,1,0,0,0,1917,1918,1,0,0,0,1918,1921,1,0,0,0,1919,
        1917,1,0,0,0,1920,1887,1,0,0,0,1920,1921,1,0,0,0,1921,1922,1,0,0,
        0,1922,1923,5,8,0,0,1923,217,1,0,0,0,1924,1925,3,222,111,0,1925,
        219,1,0,0,0,1926,1929,5,26,0,0,1927,1930,3,226,113,0,1928,1930,5,
        110,0,0,1929,1927,1,0,0,0,1929,1928,1,0,0,0,1930,221,1,0,0,0,1931,
        1934,3,226,113,0,1932,1934,3,224,112,0,1933,1931,1,0,0,0,1933,1932,
        1,0,0,0,1934,223,1,0,0,0,1935,1936,7,7,0,0,1936,225,1,0,0,0,1937,
        1938,7,8,0,0,1938,227,1,0,0,0,1939,1940,7,9,0,0,1940,229,1,0,0,0,
        1941,1942,7,10,0,0,1942,231,1,0,0,0,1943,1944,7,11,0,0,1944,233,
        1,0,0,0,359,235,239,242,245,254,260,267,271,275,279,283,289,293,
        297,301,304,308,311,318,322,326,330,334,340,344,348,352,355,359,
        362,368,372,376,380,385,389,399,407,411,416,421,429,437,441,446,
        451,461,465,470,477,482,485,489,493,497,503,507,512,517,521,524,
        526,530,534,539,543,548,552,563,570,579,593,597,601,609,613,618,
        621,627,631,635,641,645,649,652,656,666,673,686,690,696,700,704,
        709,714,718,724,728,734,738,744,748,752,756,760,764,769,776,780,
        785,792,798,803,809,812,818,820,824,828,833,837,840,847,854,857,
        863,866,872,876,880,884,888,893,898,902,907,910,919,928,933,946,
        949,957,961,966,971,975,980,984,988,992,996,1002,1007,1014,1018,
        1023,1027,1031,1033,1037,1039,1043,1045,1051,1057,1061,1064,1067,
        1071,1077,1081,1084,1087,1093,1096,1099,1103,1109,1112,1115,1119,
        1123,1127,1129,1133,1135,1138,1142,1144,1150,1154,1158,1162,1165,
        1170,1175,1180,1185,1191,1195,1197,1201,1205,1207,1209,1217,1222,
        1233,1243,1253,1258,1262,1269,1274,1279,1284,1289,1294,1299,1304,
        1307,1313,1315,1328,1331,1338,1352,1356,1360,1364,1368,1371,1373,
        1378,1382,1386,1390,1394,1398,1401,1403,1408,1412,1417,1423,1426,
        1430,1434,1437,1439,1443,1446,1454,1458,1461,1465,1474,1478,1482,
        1495,1499,1504,1508,1512,1517,1519,1522,1526,1529,1532,1538,1542,
        1546,1552,1556,1560,1563,1566,1572,1576,1580,1582,1586,1590,1592,
        1596,1600,1606,1610,1614,1620,1624,1628,1634,1638,1642,1648,1652,
        1656,1660,1664,1667,1673,1677,1689,1693,1697,1701,1705,1709,1713,
        1717,1721,1727,1731,1735,1737,1741,1745,1749,1753,1756,1765,1769,
        1774,1778,1782,1785,1787,1790,1796,1800,1804,1808,1812,1816,1819,
        1835,1846,1852,1860,1864,1868,1872,1876,1879,1885,1889,1893,1897,
        1901,1905,1909,1913,1917,1920,1929,1933
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
    public INDEX(): antlr.TerminalNode {
        return this.getToken(CypherParser.INDEX, 0)!;
    }
    public oC_IndexQualifier(): OC_IndexQualifierContext | null {
        return this.getRuleContext(0, OC_IndexQualifierContext);
    }
    public OPTIONS(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.OPTIONS, 0);
    }
    public oC_MapLiteral(): OC_MapLiteralContext | null {
        return this.getRuleContext(0, OC_MapLiteralContext);
    }
    public FOR(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.FOR, 0);
    }
    public oC_IndexEntity(): OC_IndexEntityContext | null {
        return this.getRuleContext(0, OC_IndexEntityContext);
    }
    public ON(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.ON, 0);
    }
    public oC_IndexProperties(): OC_IndexPropertiesContext | null {
        return this.getRuleContext(0, OC_IndexPropertiesContext);
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
    public INDEX(): antlr.TerminalNode {
        return this.getToken(CypherParser.INDEX, 0)!;
    }
    public oC_IndexQualifier(): OC_IndexQualifierContext | null {
        return this.getRuleContext(0, OC_IndexQualifierContext);
    }
    public OPTIONS(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.OPTIONS, 0);
    }
    public oC_MapLiteral(): OC_MapLiteralContext | null {
        return this.getRuleContext(0, OC_MapLiteralContext);
    }
    public FOR(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.FOR, 0);
    }
    public oC_IndexEntity(): OC_IndexEntityContext | null {
        return this.getRuleContext(0, OC_IndexEntityContext);
    }
    public ON(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.ON, 0);
    }
    public oC_IndexProperties(): OC_IndexPropertiesContext | null {
        return this.getRuleContext(0, OC_IndexPropertiesContext);
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
