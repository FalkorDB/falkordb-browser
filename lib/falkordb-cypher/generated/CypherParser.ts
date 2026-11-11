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
    public static readonly RULE_oC_ParameterHeader = 1;
    public static readonly RULE_oC_Statement = 2;
    public static readonly RULE_oC_Query = 3;
    public static readonly RULE_oC_FalkorCommand = 4;
    public static readonly RULE_oC_CreateIndex = 5;
    public static readonly RULE_oC_DropIndex = 6;
    public static readonly RULE_oC_IndexQualifier = 7;
    public static readonly RULE_oC_IndexEntity = 8;
    public static readonly RULE_oC_IndexProperties = 9;
    public static readonly RULE_oC_CreateConstraint = 10;
    public static readonly RULE_oC_DropConstraint = 11;
    public static readonly RULE_oC_ConstraintPredicate = 12;
    public static readonly RULE_oC_RegularQuery = 13;
    public static readonly RULE_oC_Union = 14;
    public static readonly RULE_oC_SingleQuery = 15;
    public static readonly RULE_oC_SinglePartQuery = 16;
    public static readonly RULE_oC_MultiPartQuery = 17;
    public static readonly RULE_oC_UpdatingClause = 18;
    public static readonly RULE_oC_ReadingClause = 19;
    public static readonly RULE_oC_LoadCsv = 20;
    public static readonly RULE_oC_Foreach = 21;
    public static readonly RULE_oC_CallSubquery = 22;
    public static readonly RULE_oC_Match = 23;
    public static readonly RULE_oC_Unwind = 24;
    public static readonly RULE_oC_Merge = 25;
    public static readonly RULE_oC_MergeAction = 26;
    public static readonly RULE_oC_Create = 27;
    public static readonly RULE_oC_Set = 28;
    public static readonly RULE_oC_SetItem = 29;
    public static readonly RULE_oC_Delete = 30;
    public static readonly RULE_oC_Remove = 31;
    public static readonly RULE_oC_RemoveItem = 32;
    public static readonly RULE_oC_InQueryCall = 33;
    public static readonly RULE_oC_StandaloneCall = 34;
    public static readonly RULE_oC_YieldItems = 35;
    public static readonly RULE_oC_YieldItem = 36;
    public static readonly RULE_oC_With = 37;
    public static readonly RULE_oC_Return = 38;
    public static readonly RULE_oC_ProjectionBody = 39;
    public static readonly RULE_oC_ProjectionItems = 40;
    public static readonly RULE_oC_ProjectionItem = 41;
    public static readonly RULE_oC_MapProjection = 42;
    public static readonly RULE_oC_MapProjectionElement = 43;
    public static readonly RULE_oC_Order = 44;
    public static readonly RULE_oC_Skip = 45;
    public static readonly RULE_oC_Limit = 46;
    public static readonly RULE_oC_SortItem = 47;
    public static readonly RULE_oC_Where = 48;
    public static readonly RULE_oC_Pattern = 49;
    public static readonly RULE_oC_PatternPart = 50;
    public static readonly RULE_oC_AnonymousPatternPart = 51;
    public static readonly RULE_oC_ShortestPathPattern = 52;
    public static readonly RULE_oC_PatternElement = 53;
    public static readonly RULE_oC_RelationshipsPattern = 54;
    public static readonly RULE_oC_NodePattern = 55;
    public static readonly RULE_oC_PatternElementChain = 56;
    public static readonly RULE_oC_RelationshipPattern = 57;
    public static readonly RULE_oC_RelationshipDetail = 58;
    public static readonly RULE_oC_Properties = 59;
    public static readonly RULE_oC_RelationshipTypes = 60;
    public static readonly RULE_oC_NodeLabels = 61;
    public static readonly RULE_oC_NodeLabel = 62;
    public static readonly RULE_oC_RangeLiteral = 63;
    public static readonly RULE_oC_LabelName = 64;
    public static readonly RULE_oC_RelTypeName = 65;
    public static readonly RULE_oC_PropertyExpression = 66;
    public static readonly RULE_oC_Expression = 67;
    public static readonly RULE_oC_OrExpression = 68;
    public static readonly RULE_oC_XorExpression = 69;
    public static readonly RULE_oC_AndExpression = 70;
    public static readonly RULE_oC_NotExpression = 71;
    public static readonly RULE_oC_ComparisonExpression = 72;
    public static readonly RULE_oC_PartialComparisonExpression = 73;
    public static readonly RULE_oC_StringListNullPredicateExpression = 74;
    public static readonly RULE_oC_StringPredicateExpression = 75;
    public static readonly RULE_oC_ListPredicateExpression = 76;
    public static readonly RULE_oC_NullPredicateExpression = 77;
    public static readonly RULE_oC_AddOrSubtractExpression = 78;
    public static readonly RULE_oC_MultiplyDivideModuloExpression = 79;
    public static readonly RULE_oC_PowerOfExpression = 80;
    public static readonly RULE_oC_UnaryAddOrSubtractExpression = 81;
    public static readonly RULE_oC_NonArithmeticOperatorExpression = 82;
    public static readonly RULE_oC_ListOperatorExpression = 83;
    public static readonly RULE_oC_PropertyLookup = 84;
    public static readonly RULE_oC_Atom = 85;
    public static readonly RULE_oC_CaseExpression = 86;
    public static readonly RULE_oC_CaseAlternative = 87;
    public static readonly RULE_oC_ListComprehension = 88;
    public static readonly RULE_oC_PatternComprehension = 89;
    public static readonly RULE_oC_Quantifier = 90;
    public static readonly RULE_oC_FilterExpression = 91;
    public static readonly RULE_oC_PatternPredicate = 92;
    public static readonly RULE_oC_ParenthesizedExpression = 93;
    public static readonly RULE_oC_IdInColl = 94;
    public static readonly RULE_oC_ReduceExpression = 95;
    public static readonly RULE_oC_FunctionInvocation = 96;
    public static readonly RULE_oC_FunctionName = 97;
    public static readonly RULE_oC_ExistentialSubquery = 98;
    public static readonly RULE_oC_ExplicitProcedureInvocation = 99;
    public static readonly RULE_oC_ImplicitProcedureInvocation = 100;
    public static readonly RULE_oC_ProcedureResultField = 101;
    public static readonly RULE_oC_ProcedureName = 102;
    public static readonly RULE_oC_Namespace = 103;
    public static readonly RULE_oC_Variable = 104;
    public static readonly RULE_oC_Literal = 105;
    public static readonly RULE_oC_BooleanLiteral = 106;
    public static readonly RULE_oC_NumberLiteral = 107;
    public static readonly RULE_oC_IntegerLiteral = 108;
    public static readonly RULE_oC_DoubleLiteral = 109;
    public static readonly RULE_oC_ListLiteral = 110;
    public static readonly RULE_oC_MapLiteral = 111;
    public static readonly RULE_oC_PropertyKeyName = 112;
    public static readonly RULE_oC_Parameter = 113;
    public static readonly RULE_oC_SchemaName = 114;
    public static readonly RULE_oC_ReservedWord = 115;
    public static readonly RULE_oC_SymbolicName = 116;
    public static readonly RULE_oC_LeftArrowHead = 117;
    public static readonly RULE_oC_RightArrowHead = 118;
    public static readonly RULE_oC_Dash = 119;

    public static readonly literalNames = [
        null, "';'", "'='", "':'", "'('", "','", "')'", "'|'", "'{'", "'}'",
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
        "oC_Cypher", "oC_ParameterHeader", "oC_Statement", "oC_Query", "oC_FalkorCommand",
        "oC_CreateIndex", "oC_DropIndex", "oC_IndexQualifier", "oC_IndexEntity",
        "oC_IndexProperties", "oC_CreateConstraint", "oC_DropConstraint",
        "oC_ConstraintPredicate", "oC_RegularQuery", "oC_Union", "oC_SingleQuery",
        "oC_SinglePartQuery", "oC_MultiPartQuery", "oC_UpdatingClause",
        "oC_ReadingClause", "oC_LoadCsv", "oC_Foreach", "oC_CallSubquery",
        "oC_Match", "oC_Unwind", "oC_Merge", "oC_MergeAction", "oC_Create",
        "oC_Set", "oC_SetItem", "oC_Delete", "oC_Remove", "oC_RemoveItem",
        "oC_InQueryCall", "oC_StandaloneCall", "oC_YieldItems", "oC_YieldItem",
        "oC_With", "oC_Return", "oC_ProjectionBody", "oC_ProjectionItems",
        "oC_ProjectionItem", "oC_MapProjection", "oC_MapProjectionElement",
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

            this.state = 256;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 135) {
                {
                {
                this.state = 243;
                this.match(CypherParser.CYPHER);
                this.state = 248;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 1, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 244;
                        this.match(CypherParser.SP);
                        this.state = 245;
                        this.oC_ParameterHeader();
                        }
                        }
                    }
                    this.state = 250;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 1, this.context);
                }
                this.state = 252;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 251;
                    this.match(CypherParser.SP);
                    }
                }

                }
                }
                this.state = 258;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 259;
            this.oC_Statement();
            this.state = 264;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 5, this.context) ) {
            case 1:
                {
                this.state = 261;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 260;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 263;
                this.match(CypherParser.T__0);
                }
                break;
            }
            this.state = 267;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 266;
                this.match(CypherParser.SP);
                }
            }

            this.state = 269;
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
    public oC_ParameterHeader(): OC_ParameterHeaderContext {
        let localContext = new OC_ParameterHeaderContext(this.context, this.state);
        this.enterRule(localContext, 2, CypherParser.RULE_oC_ParameterHeader);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 271;
            this.oC_SchemaName();
            this.state = 273;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 272;
                this.match(CypherParser.SP);
                }
            }

            this.state = 275;
            this.match(CypherParser.T__1);
            this.state = 277;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 276;
                this.match(CypherParser.SP);
                }
            }

            this.state = 279;
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
    public oC_Statement(): OC_StatementContext {
        let localContext = new OC_StatementContext(this.context, this.state);
        this.enterRule(localContext, 4, CypherParser.RULE_oC_Statement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 281;
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
        this.enterRule(localContext, 6, CypherParser.RULE_oC_Query);
        try {
            this.state = 286;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 9, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 283;
                this.oC_RegularQuery();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 284;
                this.oC_StandaloneCall();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 285;
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
        this.enterRule(localContext, 8, CypherParser.RULE_oC_FalkorCommand);
        try {
            this.state = 292;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 10, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 288;
                this.oC_CreateIndex();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 289;
                this.oC_DropIndex();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 290;
                this.oC_CreateConstraint();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 291;
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
        this.enterRule(localContext, 10, CypherParser.RULE_oC_CreateIndex);
        let _la: number;
        try {
            this.state = 365;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 26, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 294;
                this.match(CypherParser.CREATE);
                this.state = 295;
                this.match(CypherParser.SP);
                this.state = 296;
                this.oC_IndexQualifier();
                this.state = 297;
                this.match(CypherParser.SP);
                this.state = 298;
                this.match(CypherParser.INDEX);
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
                this.match(CypherParser.FOR);
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
                this.oC_IndexEntity();
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
                this.match(CypherParser.ON);
                this.state = 312;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 311;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 314;
                this.oC_IndexProperties();
                this.state = 323;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 17, this.context) ) {
                case 1:
                    {
                    this.state = 316;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 315;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 318;
                    this.match(CypherParser.OPTIONS);
                    this.state = 320;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 319;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 322;
                    this.oC_MapLiteral();
                    }
                    break;
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 325;
                this.match(CypherParser.CREATE);
                this.state = 326;
                this.match(CypherParser.SP);
                this.state = 327;
                this.match(CypherParser.INDEX);
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
                this.match(CypherParser.FOR);
                this.state = 333;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 332;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 335;
                this.oC_IndexEntity();
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
                this.oC_IndexProperties();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 345;
                this.match(CypherParser.CREATE);
                this.state = 346;
                this.match(CypherParser.SP);
                this.state = 347;
                this.match(CypherParser.INDEX);
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
                this.match(CypherParser.ON);
                this.state = 353;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 352;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 355;
                this.match(CypherParser.T__2);
                this.state = 357;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 356;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 359;
                this.oC_LabelName();
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
        this.enterRule(localContext, 12, CypherParser.RULE_oC_DropIndex);
        let _la: number;
        try {
            this.state = 429;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 39, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 367;
                this.match(CypherParser.DROP);
                this.state = 368;
                this.match(CypherParser.SP);
                this.state = 369;
                this.oC_IndexQualifier();
                this.state = 370;
                this.match(CypherParser.SP);
                this.state = 371;
                this.match(CypherParser.INDEX);
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
                this.match(CypherParser.FOR);
                this.state = 377;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 376;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 379;
                this.oC_IndexEntity();
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
                this.match(CypherParser.ON);
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
                this.oC_IndexProperties();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 389;
                this.match(CypherParser.DROP);
                this.state = 390;
                this.match(CypherParser.SP);
                this.state = 391;
                this.match(CypherParser.INDEX);
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
                this.match(CypherParser.FOR);
                this.state = 397;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 396;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 399;
                this.oC_IndexEntity();
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
                this.oC_IndexProperties();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 409;
                this.match(CypherParser.DROP);
                this.state = 410;
                this.match(CypherParser.SP);
                this.state = 411;
                this.match(CypherParser.INDEX);
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
                this.match(CypherParser.ON);
                this.state = 417;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 416;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 419;
                this.match(CypherParser.T__2);
                this.state = 421;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 420;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 423;
                this.oC_LabelName();
                this.state = 425;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 424;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 427;
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
        this.enterRule(localContext, 14, CypherParser.RULE_oC_IndexQualifier);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 431;
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
        this.enterRule(localContext, 16, CypherParser.RULE_oC_IndexEntity);
        try {
            this.state = 435;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 40, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 433;
                this.oC_NodePattern();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 434;
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
        this.enterRule(localContext, 18, CypherParser.RULE_oC_IndexProperties);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 437;
            this.match(CypherParser.T__3);
            this.state = 439;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 438;
                this.match(CypherParser.SP);
                }
            }

            this.state = 441;
            this.oC_Expression();
            this.state = 452;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 44, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 443;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 442;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 445;
                    this.match(CypherParser.T__4);
                    this.state = 447;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 446;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 449;
                    this.oC_Expression();
                    }
                    }
                }
                this.state = 454;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 44, this.context);
            }
            this.state = 456;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 455;
                this.match(CypherParser.SP);
                }
            }

            this.state = 458;
            this.match(CypherParser.T__5);
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
        this.enterRule(localContext, 20, CypherParser.RULE_oC_CreateConstraint);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 460;
            this.match(CypherParser.CREATE);
            this.state = 461;
            this.match(CypherParser.SP);
            this.state = 462;
            this.match(CypherParser.CONSTRAINT);
            this.state = 463;
            this.match(CypherParser.SP);
            this.state = 464;
            this.match(CypherParser.ON);
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
            this.oC_IndexEntity();
            this.state = 469;
            this.match(CypherParser.SP);
            this.state = 470;
            this.match(CypherParser.ASSERT);
            this.state = 471;
            this.match(CypherParser.SP);
            this.state = 472;
            this.oC_Expression();
            this.state = 483;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 49, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 474;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 473;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 476;
                    this.match(CypherParser.T__4);
                    this.state = 478;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 477;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 480;
                    this.oC_Expression();
                    }
                    }
                }
                this.state = 485;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 49, this.context);
            }
            this.state = 488;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 50, this.context) ) {
            case 1:
                {
                this.state = 486;
                this.match(CypherParser.SP);
                this.state = 487;
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
        this.enterRule(localContext, 22, CypherParser.RULE_oC_DropConstraint);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 490;
            this.match(CypherParser.DROP);
            this.state = 491;
            this.match(CypherParser.SP);
            this.state = 492;
            this.match(CypherParser.CONSTRAINT);
            this.state = 493;
            this.match(CypherParser.SP);
            this.state = 494;
            this.match(CypherParser.ON);
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
            this.oC_IndexEntity();
            this.state = 499;
            this.match(CypherParser.SP);
            this.state = 500;
            this.match(CypherParser.ASSERT);
            this.state = 501;
            this.match(CypherParser.SP);
            this.state = 502;
            this.oC_Expression();
            this.state = 513;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 54, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 504;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 503;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 506;
                    this.match(CypherParser.T__4);
                    this.state = 508;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 507;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 510;
                    this.oC_Expression();
                    }
                    }
                }
                this.state = 515;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 54, this.context);
            }
            this.state = 518;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 55, this.context) ) {
            case 1:
                {
                this.state = 516;
                this.match(CypherParser.SP);
                this.state = 517;
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
        this.enterRule(localContext, 24, CypherParser.RULE_oC_ConstraintPredicate);
        try {
            this.state = 528;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 56, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 520;
                this.match(CypherParser.IS);
                this.state = 521;
                this.match(CypherParser.SP);
                this.state = 522;
                this.match(CypherParser.UNIQUE);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 523;
                this.match(CypherParser.IS);
                this.state = 524;
                this.match(CypherParser.SP);
                this.state = 525;
                this.match(CypherParser.NOT);
                this.state = 526;
                this.match(CypherParser.SP);
                this.state = 527;
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
        this.enterRule(localContext, 26, CypherParser.RULE_oC_RegularQuery);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 530;
            this.oC_SingleQuery();
            this.state = 537;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 58, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
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
                    this.oC_Union();
                    }
                    }
                }
                this.state = 539;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 58, this.context);
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
        this.enterRule(localContext, 28, CypherParser.RULE_oC_Union);
        let _la: number;
        try {
            this.state = 552;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 61, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 540;
                this.match(CypherParser.UNION);
                this.state = 541;
                this.match(CypherParser.SP);
                this.state = 542;
                this.match(CypherParser.ALL);
                this.state = 544;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 543;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 546;
                this.oC_SingleQuery();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 547;
                this.match(CypherParser.UNION);
                this.state = 549;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 548;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 551;
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
        this.enterRule(localContext, 30, CypherParser.RULE_oC_SingleQuery);
        try {
            this.state = 556;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 62, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 554;
                this.oC_SinglePartQuery();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 555;
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
        this.enterRule(localContext, 32, CypherParser.RULE_oC_SinglePartQuery);
        let _la: number;
        try {
            let alternative: number;
            this.state = 593;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 71, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 564;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (((((_la - 53)) & ~0x1F) === 0 && ((1 << (_la - 53)) & 131521) !== 0)) {
                    {
                    {
                    this.state = 558;
                    this.oC_ReadingClause();
                    this.state = 560;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 559;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 566;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 567;
                this.oC_Return();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 574;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 66, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 568;
                        this.oC_ReadingClause();
                        this.state = 570;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 569;
                            this.match(CypherParser.SP);
                            }
                        }

                        }
                        }
                    }
                    this.state = 576;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 66, this.context);
                }
                this.state = 577;
                this.oC_UpdatingClause();
                this.state = 584;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 68, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 579;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 578;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 581;
                        this.oC_UpdatingClause();
                        }
                        }
                    }
                    this.state = 586;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 68, this.context);
                }
                this.state = 591;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 70, this.context) ) {
                case 1:
                    {
                    this.state = 588;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 587;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 590;
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
        this.enterRule(localContext, 34, CypherParser.RULE_oC_MultiPartQuery);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 617;
            this.errorHandler.sync(this);
            alternative = 1;
            do {
                switch (alternative) {
                case 1:
                    {
                    {
                    this.state = 601;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 73, this.context);
                    while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                        if (alternative === 1) {
                            {
                            {
                            this.state = 595;
                            this.oC_ReadingClause();
                            this.state = 597;
                            this.errorHandler.sync(this);
                            _la = this.tokenStream.LA(1);
                            if (_la === 140) {
                                {
                                this.state = 596;
                                this.match(CypherParser.SP);
                                }
                            }

                            }
                            }
                        }
                        this.state = 603;
                        this.errorHandler.sync(this);
                        alternative = this.interpreter.adaptivePredict(this.tokenStream, 73, this.context);
                    }
                    this.state = 610;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    while (((((_la - 58)) & ~0x1F) === 0 && ((1 << (_la - 58)) & 8097) !== 0)) {
                        {
                        {
                        this.state = 604;
                        this.oC_UpdatingClause();
                        this.state = 606;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 605;
                            this.match(CypherParser.SP);
                            }
                        }

                        }
                        }
                        this.state = 612;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                    }
                    this.state = 613;
                    this.oC_With();
                    this.state = 615;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 614;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 619;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 77, this.context);
            } while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER);
            this.state = 621;
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
        this.enterRule(localContext, 36, CypherParser.RULE_oC_UpdatingClause);
        try {
            this.state = 630;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.CREATE:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 623;
                this.oC_Create();
                }
                break;
            case CypherParser.MERGE:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 624;
                this.oC_Merge();
                }
                break;
            case CypherParser.DETACH:
            case CypherParser.DELETE:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 625;
                this.oC_Delete();
                }
                break;
            case CypherParser.SET:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 626;
                this.oC_Set();
                }
                break;
            case CypherParser.REMOVE:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 627;
                this.oC_Remove();
                }
                break;
            case CypherParser.FOREACH:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 628;
                this.oC_Foreach();
                }
                break;
            case CypherParser.CALL:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 629;
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
        this.enterRule(localContext, 38, CypherParser.RULE_oC_ReadingClause);
        try {
            this.state = 637;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 79, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 632;
                this.oC_Match();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 633;
                this.oC_Unwind();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 634;
                this.oC_InQueryCall();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 635;
                this.oC_CallSubquery();
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 636;
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
        this.enterRule(localContext, 40, CypherParser.RULE_oC_LoadCsv);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 639;
            this.match(CypherParser.LOAD);
            this.state = 640;
            this.match(CypherParser.SP);
            this.state = 641;
            this.match(CypherParser.CSV);
            this.state = 646;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 80, this.context) ) {
            case 1:
                {
                this.state = 642;
                this.match(CypherParser.SP);
                this.state = 643;
                this.match(CypherParser.WITH);
                this.state = 644;
                this.match(CypherParser.SP);
                this.state = 645;
                this.match(CypherParser.HEADERS);
                }
                break;
            }
            this.state = 648;
            this.match(CypherParser.SP);
            this.state = 649;
            this.match(CypherParser.FROM);
            this.state = 650;
            this.match(CypherParser.SP);
            this.state = 651;
            this.oC_Expression();
            this.state = 652;
            this.match(CypherParser.SP);
            this.state = 653;
            this.match(CypherParser.AS);
            this.state = 654;
            this.match(CypherParser.SP);
            this.state = 655;
            this.oC_Variable();
            this.state = 660;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 81, this.context) ) {
            case 1:
                {
                this.state = 656;
                this.match(CypherParser.SP);
                this.state = 657;
                this.match(CypherParser.FIELDTERMINATOR);
                this.state = 658;
                this.match(CypherParser.SP);
                this.state = 659;
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
        this.enterRule(localContext, 42, CypherParser.RULE_oC_Foreach);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 662;
            this.match(CypherParser.FOREACH);
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
            this.match(CypherParser.T__3);
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
            this.oC_Variable();
            this.state = 671;
            this.match(CypherParser.SP);
            this.state = 672;
            this.match(CypherParser.IN);
            this.state = 673;
            this.match(CypherParser.SP);
            this.state = 674;
            this.oC_Expression();
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
            this.match(CypherParser.T__6);
            this.state = 683;
            this.errorHandler.sync(this);
            alternative = 1;
            do {
                switch (alternative) {
                case 1:
                    {
                    {
                    this.state = 680;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 679;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 682;
                    this.oC_UpdatingClause();
                    }
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 685;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 86, this.context);
            } while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER);
            this.state = 688;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 687;
                this.match(CypherParser.SP);
                }
            }

            this.state = 690;
            this.match(CypherParser.T__5);
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
        this.enterRule(localContext, 44, CypherParser.RULE_oC_CallSubquery);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 692;
            this.match(CypherParser.CALL);
            this.state = 694;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 693;
                this.match(CypherParser.SP);
                }
            }

            this.state = 696;
            this.match(CypherParser.T__7);
            this.state = 698;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 697;
                this.match(CypherParser.SP);
                }
            }

            this.state = 700;
            this.oC_RegularQuery();
            this.state = 702;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 701;
                this.match(CypherParser.SP);
                }
            }

            this.state = 704;
            this.match(CypherParser.T__8);
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
        this.enterRule(localContext, 46, CypherParser.RULE_oC_Match);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 708;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 59) {
                {
                this.state = 706;
                this.match(CypherParser.OPTIONAL);
                this.state = 707;
                this.match(CypherParser.SP);
                }
            }

            this.state = 710;
            this.match(CypherParser.MATCH);
            this.state = 712;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 711;
                this.match(CypherParser.SP);
                }
            }

            this.state = 714;
            this.oC_Pattern();
            this.state = 719;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 94, this.context) ) {
            case 1:
                {
                this.state = 716;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 715;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 718;
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
        this.enterRule(localContext, 48, CypherParser.RULE_oC_Unwind);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 721;
            this.match(CypherParser.UNWIND);
            this.state = 723;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 722;
                this.match(CypherParser.SP);
                }
            }

            this.state = 725;
            this.oC_Expression();
            this.state = 726;
            this.match(CypherParser.SP);
            this.state = 727;
            this.match(CypherParser.AS);
            this.state = 728;
            this.match(CypherParser.SP);
            this.state = 729;
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
        this.enterRule(localContext, 50, CypherParser.RULE_oC_Merge);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 731;
            this.match(CypherParser.MERGE);
            this.state = 733;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 732;
                this.match(CypherParser.SP);
                }
            }

            this.state = 735;
            this.oC_PatternPart();
            this.state = 740;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 97, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 736;
                    this.match(CypherParser.SP);
                    this.state = 737;
                    this.oC_MergeAction();
                    }
                    }
                }
                this.state = 742;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 97, this.context);
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
        this.enterRule(localContext, 52, CypherParser.RULE_oC_MergeAction);
        try {
            this.state = 753;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 98, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 743;
                this.match(CypherParser.ON);
                this.state = 744;
                this.match(CypherParser.SP);
                this.state = 745;
                this.match(CypherParser.MATCH);
                this.state = 746;
                this.match(CypherParser.SP);
                this.state = 747;
                this.oC_Set();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 748;
                this.match(CypherParser.ON);
                this.state = 749;
                this.match(CypherParser.SP);
                this.state = 750;
                this.match(CypherParser.CREATE);
                this.state = 751;
                this.match(CypherParser.SP);
                this.state = 752;
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
        this.enterRule(localContext, 54, CypherParser.RULE_oC_Create);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 755;
            this.match(CypherParser.CREATE);
            this.state = 757;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 756;
                this.match(CypherParser.SP);
                }
            }

            this.state = 759;
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
        this.enterRule(localContext, 56, CypherParser.RULE_oC_Set);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 761;
            this.match(CypherParser.SET);
            this.state = 763;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 762;
                this.match(CypherParser.SP);
                }
            }

            this.state = 765;
            this.oC_SetItem();
            this.state = 776;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 103, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 767;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 766;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 769;
                    this.match(CypherParser.T__4);
                    this.state = 771;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 770;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 773;
                    this.oC_SetItem();
                    }
                    }
                }
                this.state = 778;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 103, this.context);
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
        this.enterRule(localContext, 58, CypherParser.RULE_oC_SetItem);
        let _la: number;
        try {
            this.state = 815;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 111, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 779;
                this.oC_PropertyExpression();
                this.state = 781;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 780;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 783;
                this.match(CypherParser.T__1);
                this.state = 785;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 784;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 787;
                this.oC_Expression();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 789;
                this.oC_Variable();
                this.state = 791;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 790;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 793;
                this.match(CypherParser.T__1);
                this.state = 795;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 794;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 797;
                this.oC_Expression();
                }
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                {
                this.state = 799;
                this.oC_Variable();
                this.state = 801;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 800;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 803;
                this.match(CypherParser.T__9);
                this.state = 805;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 804;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 807;
                this.oC_Expression();
                }
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 809;
                this.oC_Variable();
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
        this.enterRule(localContext, 60, CypherParser.RULE_oC_Delete);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 819;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 67) {
                {
                this.state = 817;
                this.match(CypherParser.DETACH);
                this.state = 818;
                this.match(CypherParser.SP);
                }
            }

            this.state = 821;
            this.match(CypherParser.DELETE);
            this.state = 823;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 822;
                this.match(CypherParser.SP);
                }
            }

            this.state = 825;
            this.oC_Expression();
            this.state = 836;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 116, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 827;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 826;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 829;
                    this.match(CypherParser.T__4);
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
                    this.oC_Expression();
                    }
                    }
                }
                this.state = 838;
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
    public oC_Remove(): OC_RemoveContext {
        let localContext = new OC_RemoveContext(this.context, this.state);
        this.enterRule(localContext, 62, CypherParser.RULE_oC_Remove);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 839;
            this.match(CypherParser.REMOVE);
            this.state = 840;
            this.match(CypherParser.SP);
            this.state = 841;
            this.oC_RemoveItem();
            this.state = 852;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 119, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 843;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 842;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 845;
                    this.match(CypherParser.T__4);
                    this.state = 847;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 846;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 849;
                    this.oC_RemoveItem();
                    }
                    }
                }
                this.state = 854;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 119, this.context);
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
        this.enterRule(localContext, 64, CypherParser.RULE_oC_RemoveItem);
        try {
            this.state = 859;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 120, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 855;
                this.oC_Variable();
                this.state = 856;
                this.oC_NodeLabels();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 858;
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
        this.enterRule(localContext, 66, CypherParser.RULE_oC_InQueryCall);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 861;
            this.match(CypherParser.CALL);
            this.state = 862;
            this.match(CypherParser.SP);
            this.state = 863;
            this.oC_ExplicitProcedureInvocation();
            this.state = 870;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 122, this.context) ) {
            case 1:
                {
                this.state = 865;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 864;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 867;
                this.match(CypherParser.YIELD);
                this.state = 868;
                this.match(CypherParser.SP);
                this.state = 869;
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
        this.enterRule(localContext, 68, CypherParser.RULE_oC_StandaloneCall);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 872;
            this.match(CypherParser.CALL);
            this.state = 873;
            this.match(CypherParser.SP);
            this.state = 876;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 123, this.context) ) {
            case 1:
                {
                this.state = 874;
                this.oC_ExplicitProcedureInvocation();
                }
                break;
            case 2:
                {
                this.state = 875;
                this.oC_ImplicitProcedureInvocation();
                }
                break;
            }
            this.state = 887;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 126, this.context) ) {
            case 1:
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
                this.match(CypherParser.YIELD);
                this.state = 882;
                this.match(CypherParser.SP);
                this.state = 885;
                this.errorHandler.sync(this);
                switch (this.tokenStream.LA(1)) {
                case CypherParser.T__10:
                    {
                    this.state = 883;
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
                    this.state = 884;
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
        this.enterRule(localContext, 70, CypherParser.RULE_oC_YieldItems);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 889;
            this.oC_YieldItem();
            this.state = 900;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 129, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 891;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 890;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 893;
                    this.match(CypherParser.T__4);
                    this.state = 895;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 894;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 897;
                    this.oC_YieldItem();
                    }
                    }
                }
                this.state = 902;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 129, this.context);
            }
            this.state = 907;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 131, this.context) ) {
            case 1:
                {
                this.state = 904;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 903;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 906;
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
        this.enterRule(localContext, 72, CypherParser.RULE_oC_YieldItem);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 914;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 132, this.context) ) {
            case 1:
                {
                this.state = 909;
                this.oC_ProcedureResultField();
                this.state = 910;
                this.match(CypherParser.SP);
                this.state = 911;
                this.match(CypherParser.AS);
                this.state = 912;
                this.match(CypherParser.SP);
                }
                break;
            }
            this.state = 916;
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
        this.enterRule(localContext, 74, CypherParser.RULE_oC_With);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 918;
            this.match(CypherParser.WITH);
            this.state = 919;
            this.oC_ProjectionBody();
            this.state = 924;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 134, this.context) ) {
            case 1:
                {
                this.state = 921;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 920;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 923;
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
        this.enterRule(localContext, 76, CypherParser.RULE_oC_Return);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 926;
            this.match(CypherParser.RETURN);
            this.state = 927;
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
        this.enterRule(localContext, 78, CypherParser.RULE_oC_ProjectionBody);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 933;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 136, this.context) ) {
            case 1:
                {
                this.state = 930;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 929;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 932;
                this.match(CypherParser.DISTINCT);
                }
                break;
            }
            this.state = 935;
            this.match(CypherParser.SP);
            this.state = 936;
            this.oC_ProjectionItems();
            this.state = 939;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 137, this.context) ) {
            case 1:
                {
                this.state = 937;
                this.match(CypherParser.SP);
                this.state = 938;
                this.oC_Order();
                }
                break;
            }
            this.state = 943;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 138, this.context) ) {
            case 1:
                {
                this.state = 941;
                this.match(CypherParser.SP);
                this.state = 942;
                this.oC_Skip();
                }
                break;
            }
            this.state = 947;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 139, this.context) ) {
            case 1:
                {
                this.state = 945;
                this.match(CypherParser.SP);
                this.state = 946;
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
        this.enterRule(localContext, 80, CypherParser.RULE_oC_ProjectionItems);
        let _la: number;
        try {
            let alternative: number;
            this.state = 977;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.T__10:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 949;
                this.match(CypherParser.T__10);
                this.state = 960;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 142, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 951;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 950;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 953;
                        this.match(CypherParser.T__4);
                        this.state = 955;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 954;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 957;
                        this.oC_ProjectionItem();
                        }
                        }
                    }
                    this.state = 962;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 142, this.context);
                }
                }
                }
                break;
            case CypherParser.T__3:
            case CypherParser.T__7:
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
                this.state = 963;
                this.oC_ProjectionItem();
                this.state = 974;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 145, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 965;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 964;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 967;
                        this.match(CypherParser.T__4);
                        this.state = 969;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 968;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 971;
                        this.oC_ProjectionItem();
                        }
                        }
                    }
                    this.state = 976;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 145, this.context);
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
        this.enterRule(localContext, 82, CypherParser.RULE_oC_ProjectionItem);
        try {
            this.state = 986;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 147, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 979;
                this.oC_Expression();
                this.state = 980;
                this.match(CypherParser.SP);
                this.state = 981;
                this.match(CypherParser.AS);
                this.state = 982;
                this.match(CypherParser.SP);
                this.state = 983;
                this.oC_Variable();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 985;
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
    public oC_MapProjection(): OC_MapProjectionContext {
        let localContext = new OC_MapProjectionContext(this.context, this.state);
        this.enterRule(localContext, 84, CypherParser.RULE_oC_MapProjection);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 988;
            this.match(CypherParser.T__7);
            this.state = 990;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 148, this.context) ) {
            case 1:
                {
                this.state = 989;
                this.match(CypherParser.SP);
                }
                break;
            }
            this.state = 1006;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 12 || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 4294967295) !== 0) || ((((_la - 78)) & ~0x1F) === 0 && ((1 << (_la - 78)) & 2147483647) !== 0) || ((((_la - 112)) & ~0x1F) === 0 && ((1 << (_la - 112)) & 167770113) !== 0)) {
                {
                this.state = 992;
                this.oC_MapProjectionElement();
                this.state = 1003;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 151, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 994;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 993;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 996;
                        this.match(CypherParser.T__4);
                        this.state = 998;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 997;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1000;
                        this.oC_MapProjectionElement();
                        }
                        }
                    }
                    this.state = 1005;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 151, this.context);
                }
                }
            }

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
            this.match(CypherParser.T__8);
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
        this.enterRule(localContext, 86, CypherParser.RULE_oC_MapProjectionElement);
        let _la: number;
        try {
            this.state = 1034;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 158, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1013;
                this.match(CypherParser.T__11);
                this.state = 1015;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1014;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1017;
                this.match(CypherParser.T__10);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1018;
                this.match(CypherParser.T__11);
                this.state = 1020;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1019;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1022;
                this.oC_PropertyKeyName();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1023;
                this.oC_PropertyKeyName();
                this.state = 1025;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1024;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1027;
                this.match(CypherParser.T__2);
                this.state = 1029;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1028;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1031;
                this.oC_Expression();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 1033;
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
        this.enterRule(localContext, 88, CypherParser.RULE_oC_Order);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1036;
            this.match(CypherParser.ORDER);
            this.state = 1037;
            this.match(CypherParser.SP);
            this.state = 1038;
            this.match(CypherParser.BY);
            this.state = 1039;
            this.match(CypherParser.SP);
            this.state = 1040;
            this.oC_SortItem();
            this.state = 1048;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 5) {
                {
                {
                this.state = 1041;
                this.match(CypherParser.T__4);
                this.state = 1043;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1042;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1045;
                this.oC_SortItem();
                }
                }
                this.state = 1050;
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
        this.enterRule(localContext, 90, CypherParser.RULE_oC_Skip);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1051;
            this.match(CypherParser.L_SKIP);
            this.state = 1052;
            this.match(CypherParser.SP);
            this.state = 1053;
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
        this.enterRule(localContext, 92, CypherParser.RULE_oC_Limit);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1055;
            this.match(CypherParser.LIMIT);
            this.state = 1056;
            this.match(CypherParser.SP);
            this.state = 1057;
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
        this.enterRule(localContext, 94, CypherParser.RULE_oC_SortItem);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1059;
            this.oC_Expression();
            this.state = 1064;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 162, this.context) ) {
            case 1:
                {
                this.state = 1061;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1060;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1063;
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
        this.enterRule(localContext, 96, CypherParser.RULE_oC_Where);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1066;
            this.match(CypherParser.WHERE);
            this.state = 1067;
            this.match(CypherParser.SP);
            this.state = 1068;
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
        this.enterRule(localContext, 98, CypherParser.RULE_oC_Pattern);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1070;
            this.oC_PatternPart();
            this.state = 1081;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 165, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1072;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1071;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1074;
                    this.match(CypherParser.T__4);
                    this.state = 1076;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1075;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1078;
                    this.oC_PatternPart();
                    }
                    }
                }
                this.state = 1083;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 165, this.context);
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
        this.enterRule(localContext, 100, CypherParser.RULE_oC_PatternPart);
        let _la: number;
        try {
            this.state = 1095;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 168, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1084;
                this.oC_Variable();
                this.state = 1086;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1085;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1088;
                this.match(CypherParser.T__1);
                this.state = 1090;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1089;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1092;
                this.oC_AnonymousPatternPart();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1094;
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
        this.enterRule(localContext, 102, CypherParser.RULE_oC_AnonymousPatternPart);
        try {
            this.state = 1099;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.SHORTESTPATH:
            case CypherParser.ALLSHORTESTPATHS:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1097;
                this.oC_ShortestPathPattern();
                }
                break;
            case CypherParser.T__3:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1098;
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
        this.enterRule(localContext, 104, CypherParser.RULE_oC_ShortestPathPattern);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1101;
            _la = this.tokenStream.LA(1);
            if(!(_la === 84 || _la === 85)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            this.state = 1103;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1102;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1105;
            this.match(CypherParser.T__3);
            this.state = 1107;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1106;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1109;
            this.oC_PatternElement();
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
            this.match(CypherParser.T__5);
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
        this.enterRule(localContext, 106, CypherParser.RULE_oC_PatternElement);
        let _la: number;
        try {
            let alternative: number;
            this.state = 1129;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 175, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1115;
                this.oC_NodePattern();
                this.state = 1122;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 174, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 1117;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1116;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1119;
                        this.oC_PatternElementChain();
                        }
                        }
                    }
                    this.state = 1124;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 174, this.context);
                }
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1125;
                this.match(CypherParser.T__3);
                this.state = 1126;
                this.oC_PatternElement();
                this.state = 1127;
                this.match(CypherParser.T__5);
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
        this.enterRule(localContext, 108, CypherParser.RULE_oC_RelationshipsPattern);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1131;
            this.oC_NodePattern();
            this.state = 1136;
            this.errorHandler.sync(this);
            alternative = 1;
            do {
                switch (alternative) {
                case 1:
                    {
                    {
                    this.state = 1133;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1132;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1135;
                    this.oC_PatternElementChain();
                    }
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 1138;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 177, this.context);
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
        this.enterRule(localContext, 110, CypherParser.RULE_oC_NodePattern);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1140;
            this.match(CypherParser.T__3);
            this.state = 1142;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1141;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1148;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 58724255) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 276566019) !== 0) || ((((_la - 132)) & ~0x1F) === 0 && ((1 << (_la - 132)) & 159) !== 0)) {
                {
                this.state = 1144;
                this.oC_Variable();
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
            if (_la === 3) {
                {
                this.state = 1150;
                this.oC_NodeLabels();
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

            this.state = 1160;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 8 || _la === 26) {
                {
                this.state = 1156;
                this.oC_Properties();
                this.state = 1158;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1157;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1162;
            this.match(CypherParser.T__5);
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
        this.enterRule(localContext, 112, CypherParser.RULE_oC_PatternElementChain);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1164;
            this.oC_RelationshipPattern();
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
        this.enterRule(localContext, 114, CypherParser.RULE_oC_RelationshipPattern);
        let _la: number;
        try {
            this.state = 1234;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 202, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1170;
                this.oC_LeftArrowHead();
                this.state = 1172;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1171;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1174;
                this.oC_Dash();
                this.state = 1176;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 187, this.context) ) {
                case 1:
                    {
                    this.state = 1175;
                    this.match(CypherParser.SP);
                    }
                    break;
                }
                this.state = 1179;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 13) {
                    {
                    this.state = 1178;
                    this.oC_RelationshipDetail();
                    }
                }

                this.state = 1182;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1181;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1184;
                this.oC_Dash();
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
                this.oC_RightArrowHead();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1190;
                this.oC_LeftArrowHead();
                this.state = 1192;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1191;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1194;
                this.oC_Dash();
                this.state = 1196;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 192, this.context) ) {
                case 1:
                    {
                    this.state = 1195;
                    this.match(CypherParser.SP);
                    }
                    break;
                }
                this.state = 1199;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 13) {
                    {
                    this.state = 1198;
                    this.oC_RelationshipDetail();
                    }
                }

                this.state = 1202;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1201;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1204;
                this.oC_Dash();
                }
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                {
                this.state = 1206;
                this.oC_Dash();
                this.state = 1208;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 195, this.context) ) {
                case 1:
                    {
                    this.state = 1207;
                    this.match(CypherParser.SP);
                    }
                    break;
                }
                this.state = 1211;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 13) {
                    {
                    this.state = 1210;
                    this.oC_RelationshipDetail();
                    }
                }

                this.state = 1214;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1213;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1216;
                this.oC_Dash();
                this.state = 1218;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1217;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1220;
                this.oC_RightArrowHead();
                }
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 1222;
                this.oC_Dash();
                this.state = 1224;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 199, this.context) ) {
                case 1:
                    {
                    this.state = 1223;
                    this.match(CypherParser.SP);
                    }
                    break;
                }
                this.state = 1227;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 13) {
                    {
                    this.state = 1226;
                    this.oC_RelationshipDetail();
                    }
                }

                this.state = 1230;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1229;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1232;
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
        this.enterRule(localContext, 116, CypherParser.RULE_oC_RelationshipDetail);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1236;
            this.match(CypherParser.T__12);
            this.state = 1238;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1237;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1244;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 58724255) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 276566019) !== 0) || ((((_la - 132)) & ~0x1F) === 0 && ((1 << (_la - 132)) & 159) !== 0)) {
                {
                this.state = 1240;
                this.oC_Variable();
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

            this.state = 1250;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 3) {
                {
                this.state = 1246;
                this.oC_RelationshipTypes();
                this.state = 1248;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1247;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1253;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 11) {
                {
                this.state = 1252;
                this.oC_RangeLiteral();
                }
            }

            this.state = 1259;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 8 || _la === 26) {
                {
                this.state = 1255;
                this.oC_Properties();
                this.state = 1257;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1256;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1261;
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
        this.enterRule(localContext, 118, CypherParser.RULE_oC_Properties);
        try {
            this.state = 1265;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.T__7:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1263;
                this.oC_MapLiteral();
                }
                break;
            case CypherParser.T__25:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1264;
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
        this.enterRule(localContext, 120, CypherParser.RULE_oC_RelationshipTypes);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1267;
            this.match(CypherParser.T__2);
            this.state = 1269;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1268;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1271;
            this.oC_RelTypeName();
            this.state = 1285;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 216, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1273;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1272;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1275;
                    this.match(CypherParser.T__6);
                    this.state = 1277;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 3) {
                        {
                        this.state = 1276;
                        this.match(CypherParser.T__2);
                        }
                    }

                    this.state = 1280;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1279;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1282;
                    this.oC_RelTypeName();
                    }
                    }
                }
                this.state = 1287;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 216, this.context);
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
        this.enterRule(localContext, 122, CypherParser.RULE_oC_NodeLabels);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1288;
            this.oC_NodeLabel();
            this.state = 1295;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 218, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1290;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1289;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1292;
                    this.oC_NodeLabel();
                    }
                    }
                }
                this.state = 1297;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 218, this.context);
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
        this.enterRule(localContext, 124, CypherParser.RULE_oC_NodeLabel);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1298;
            this.match(CypherParser.T__2);
            this.state = 1300;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1299;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1302;
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
        this.enterRule(localContext, 126, CypherParser.RULE_oC_RangeLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1304;
            this.match(CypherParser.T__10);
            this.state = 1306;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1305;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1312;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 109)) & ~0x1F) === 0 && ((1 << (_la - 109)) & 7) !== 0)) {
                {
                this.state = 1308;
                this.oC_IntegerLiteral();
                this.state = 1310;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1309;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1324;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 15) {
                {
                this.state = 1314;
                this.match(CypherParser.T__14);
                this.state = 1316;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1315;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1322;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (((((_la - 109)) & ~0x1F) === 0 && ((1 << (_la - 109)) & 7) !== 0)) {
                    {
                    this.state = 1318;
                    this.oC_IntegerLiteral();
                    this.state = 1320;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1319;
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
        this.enterRule(localContext, 128, CypherParser.RULE_oC_LabelName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1326;
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
        this.enterRule(localContext, 130, CypherParser.RULE_oC_RelTypeName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1328;
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
        this.enterRule(localContext, 132, CypherParser.RULE_oC_PropertyExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1330;
            this.oC_Atom();
            this.state = 1335;
            this.errorHandler.sync(this);
            alternative = 1;
            do {
                switch (alternative) {
                case 1:
                    {
                    {
                    this.state = 1332;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1331;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1334;
                    this.oC_PropertyLookup();
                    }
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 1337;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 228, this.context);
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
        this.enterRule(localContext, 134, CypherParser.RULE_oC_Expression);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1339;
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
        this.enterRule(localContext, 136, CypherParser.RULE_oC_OrExpression);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1341;
            this.oC_XorExpression();
            this.state = 1348;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 229, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1342;
                    this.match(CypherParser.SP);
                    this.state = 1343;
                    this.match(CypherParser.OR);
                    this.state = 1344;
                    this.match(CypherParser.SP);
                    this.state = 1345;
                    this.oC_XorExpression();
                    }
                    }
                }
                this.state = 1350;
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
    public oC_XorExpression(): OC_XorExpressionContext {
        let localContext = new OC_XorExpressionContext(this.context, this.state);
        this.enterRule(localContext, 138, CypherParser.RULE_oC_XorExpression);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1351;
            this.oC_AndExpression();
            this.state = 1358;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 230, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1352;
                    this.match(CypherParser.SP);
                    this.state = 1353;
                    this.match(CypherParser.XOR);
                    this.state = 1354;
                    this.match(CypherParser.SP);
                    this.state = 1355;
                    this.oC_AndExpression();
                    }
                    }
                }
                this.state = 1360;
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
    public oC_AndExpression(): OC_AndExpressionContext {
        let localContext = new OC_AndExpressionContext(this.context, this.state);
        this.enterRule(localContext, 140, CypherParser.RULE_oC_AndExpression);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1361;
            this.oC_NotExpression();
            this.state = 1368;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 231, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1362;
                    this.match(CypherParser.SP);
                    this.state = 1363;
                    this.match(CypherParser.AND);
                    this.state = 1364;
                    this.match(CypherParser.SP);
                    this.state = 1365;
                    this.oC_NotExpression();
                    }
                    }
                }
                this.state = 1370;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 231, this.context);
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
        this.enterRule(localContext, 142, CypherParser.RULE_oC_NotExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1377;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 89) {
                {
                {
                this.state = 1371;
                this.match(CypherParser.NOT);
                this.state = 1373;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1372;
                    this.match(CypherParser.SP);
                    }
                }

                }
                }
                this.state = 1379;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 1380;
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
        this.enterRule(localContext, 144, CypherParser.RULE_oC_ComparisonExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1382;
            this.oC_StringListNullPredicateExpression();
            this.state = 1389;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 235, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1384;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1383;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1386;
                    this.oC_PartialComparisonExpression();
                    }
                    }
                }
                this.state = 1391;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 235, this.context);
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
        this.enterRule(localContext, 146, CypherParser.RULE_oC_PartialComparisonExpression);
        let _la: number;
        try {
            this.state = 1422;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.T__1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1392;
                this.match(CypherParser.T__1);
                this.state = 1394;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1393;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1396;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__15:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1397;
                this.match(CypherParser.T__15);
                this.state = 1399;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1398;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1401;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__16:
                this.enterOuterAlt(localContext, 3);
                {
                {
                this.state = 1402;
                this.match(CypherParser.T__16);
                this.state = 1404;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1403;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1406;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__17:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 1407;
                this.match(CypherParser.T__17);
                this.state = 1409;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1408;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1411;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__18:
                this.enterOuterAlt(localContext, 5);
                {
                {
                this.state = 1412;
                this.match(CypherParser.T__18);
                this.state = 1414;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1413;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1416;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__19:
                this.enterOuterAlt(localContext, 6);
                {
                {
                this.state = 1417;
                this.match(CypherParser.T__19);
                this.state = 1419;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1418;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1421;
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
        this.enterRule(localContext, 148, CypherParser.RULE_oC_StringListNullPredicateExpression);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1424;
            this.oC_AddOrSubtractExpression();
            this.state = 1430;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 244, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    this.state = 1428;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 243, this.context) ) {
                    case 1:
                        {
                        this.state = 1425;
                        this.oC_StringPredicateExpression();
                        }
                        break;
                    case 2:
                        {
                        this.state = 1426;
                        this.oC_ListPredicateExpression();
                        }
                        break;
                    case 3:
                        {
                        this.state = 1427;
                        this.oC_NullPredicateExpression();
                        }
                        break;
                    }
                    }
                }
                this.state = 1432;
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
    public oC_StringPredicateExpression(): OC_StringPredicateExpressionContext {
        let localContext = new OC_StringPredicateExpressionContext(this.context, this.state);
        this.enterRule(localContext, 150, CypherParser.RULE_oC_StringPredicateExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1443;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 245, this.context) ) {
            case 1:
                {
                {
                this.state = 1433;
                this.match(CypherParser.SP);
                this.state = 1434;
                this.match(CypherParser.STARTS);
                this.state = 1435;
                this.match(CypherParser.SP);
                this.state = 1436;
                this.match(CypherParser.WITH);
                }
                }
                break;
            case 2:
                {
                {
                this.state = 1437;
                this.match(CypherParser.SP);
                this.state = 1438;
                this.match(CypherParser.ENDS);
                this.state = 1439;
                this.match(CypherParser.SP);
                this.state = 1440;
                this.match(CypherParser.WITH);
                }
                }
                break;
            case 3:
                {
                {
                this.state = 1441;
                this.match(CypherParser.SP);
                this.state = 1442;
                this.match(CypherParser.CONTAINS);
                }
                }
                break;
            }
            this.state = 1446;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1445;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1448;
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
        this.enterRule(localContext, 152, CypherParser.RULE_oC_ListPredicateExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1450;
            this.match(CypherParser.SP);
            this.state = 1451;
            this.match(CypherParser.IN);
            this.state = 1453;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1452;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1455;
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
        this.enterRule(localContext, 154, CypherParser.RULE_oC_NullPredicateExpression);
        try {
            this.state = 1467;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 248, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1457;
                this.match(CypherParser.SP);
                this.state = 1458;
                this.match(CypherParser.IS);
                this.state = 1459;
                this.match(CypherParser.SP);
                this.state = 1460;
                this.match(CypherParser.NULL);
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1461;
                this.match(CypherParser.SP);
                this.state = 1462;
                this.match(CypherParser.IS);
                this.state = 1463;
                this.match(CypherParser.SP);
                this.state = 1464;
                this.match(CypherParser.NOT);
                this.state = 1465;
                this.match(CypherParser.SP);
                this.state = 1466;
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
        this.enterRule(localContext, 156, CypherParser.RULE_oC_AddOrSubtractExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1469;
            this.oC_MultiplyDivideModuloExpression();
            this.state = 1488;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 254, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    this.state = 1486;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 253, this.context) ) {
                    case 1:
                        {
                        {
                        this.state = 1471;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1470;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1473;
                        this.match(CypherParser.T__20);
                        this.state = 1475;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1474;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1477;
                        this.oC_MultiplyDivideModuloExpression();
                        }
                        }
                        break;
                    case 2:
                        {
                        {
                        this.state = 1479;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1478;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1481;
                        this.match(CypherParser.T__21);
                        this.state = 1483;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1482;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1485;
                        this.oC_MultiplyDivideModuloExpression();
                        }
                        }
                        break;
                    }
                    }
                }
                this.state = 1490;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 254, this.context);
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
        this.enterRule(localContext, 158, CypherParser.RULE_oC_MultiplyDivideModuloExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1491;
            this.oC_PowerOfExpression();
            this.state = 1518;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 262, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    this.state = 1516;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 261, this.context) ) {
                    case 1:
                        {
                        {
                        this.state = 1493;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1492;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1495;
                        this.match(CypherParser.T__10);
                        this.state = 1497;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1496;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1499;
                        this.oC_PowerOfExpression();
                        }
                        }
                        break;
                    case 2:
                        {
                        {
                        this.state = 1501;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1500;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1503;
                        this.match(CypherParser.T__22);
                        this.state = 1505;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1504;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1507;
                        this.oC_PowerOfExpression();
                        }
                        }
                        break;
                    case 3:
                        {
                        {
                        this.state = 1509;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1508;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1511;
                        this.match(CypherParser.T__23);
                        this.state = 1513;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1512;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1515;
                        this.oC_PowerOfExpression();
                        }
                        }
                        break;
                    }
                    }
                }
                this.state = 1520;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 262, this.context);
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
        this.enterRule(localContext, 160, CypherParser.RULE_oC_PowerOfExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1521;
            this.oC_UnaryAddOrSubtractExpression();
            this.state = 1532;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 265, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1523;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1522;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1525;
                    this.match(CypherParser.T__24);
                    this.state = 1527;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1526;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1529;
                    this.oC_UnaryAddOrSubtractExpression();
                    }
                    }
                }
                this.state = 1534;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 265, this.context);
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
        this.enterRule(localContext, 162, CypherParser.RULE_oC_UnaryAddOrSubtractExpression);
        let _la: number;
        try {
            this.state = 1541;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.T__3:
            case CypherParser.T__7:
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
                this.state = 1535;
                this.oC_NonArithmeticOperatorExpression();
                }
                break;
            case CypherParser.T__20:
            case CypherParser.T__21:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1536;
                _la = this.tokenStream.LA(1);
                if(!(_la === 21 || _la === 22)) {
                this.errorHandler.recoverInline(this);
                }
                else {
                    this.errorHandler.reportMatch(this);
                    this.consume();
                }
                this.state = 1538;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1537;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1540;
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
        this.enterRule(localContext, 164, CypherParser.RULE_oC_NonArithmeticOperatorExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1543;
            this.oC_Atom();
            this.state = 1554;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 271, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    this.state = 1552;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 270, this.context) ) {
                    case 1:
                        {
                        {
                        this.state = 1545;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1544;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1547;
                        this.oC_ListOperatorExpression();
                        }
                        }
                        break;
                    case 2:
                        {
                        {
                        this.state = 1549;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1548;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1551;
                        this.oC_PropertyLookup();
                        }
                        }
                        break;
                    }
                    }
                }
                this.state = 1556;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 271, this.context);
            }
            this.state = 1561;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 273, this.context) ) {
            case 1:
                {
                this.state = 1558;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1557;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1560;
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
        this.enterRule(localContext, 166, CypherParser.RULE_oC_ListOperatorExpression);
        let _la: number;
        try {
            this.state = 1576;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 276, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1563;
                this.match(CypherParser.T__12);
                this.state = 1564;
                this.oC_Expression();
                this.state = 1565;
                this.match(CypherParser.T__13);
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1567;
                this.match(CypherParser.T__12);
                this.state = 1569;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 73408784) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 58724319) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 536623139) !== 0) || ((((_la - 119)) & ~0x1F) === 0 && ((1 << (_la - 119)) & 1302535) !== 0)) {
                    {
                    this.state = 1568;
                    this.oC_Expression();
                    }
                }

                this.state = 1571;
                this.match(CypherParser.T__14);
                this.state = 1573;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 73408784) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 58724319) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 536623139) !== 0) || ((((_la - 119)) & ~0x1F) === 0 && ((1 << (_la - 119)) & 1302535) !== 0)) {
                    {
                    this.state = 1572;
                    this.oC_Expression();
                    }
                }

                this.state = 1575;
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
        this.enterRule(localContext, 168, CypherParser.RULE_oC_PropertyLookup);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1578;
            this.match(CypherParser.T__11);
            this.state = 1580;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1579;
                this.match(CypherParser.SP);
                }
            }

            {
            this.state = 1582;
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
        this.enterRule(localContext, 170, CypherParser.RULE_oC_Atom);
        let _la: number;
        try {
            this.state = 1616;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 283, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1584;
                this.oC_Literal();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1585;
                this.oC_Parameter();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1586;
                this.oC_CaseExpression();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 1587;
                this.match(CypherParser.COUNT);
                this.state = 1589;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1588;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1591;
                this.match(CypherParser.T__3);
                this.state = 1593;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1592;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1595;
                this.match(CypherParser.T__10);
                this.state = 1597;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1596;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1599;
                this.match(CypherParser.T__5);
                }
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 1600;
                this.oC_ListComprehension();
                }
                break;
            case 6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 1601;
                this.oC_PatternComprehension();
                }
                break;
            case 7:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 1602;
                this.oC_ReduceExpression();
                }
                break;
            case 8:
                this.enterOuterAlt(localContext, 8);
                {
                this.state = 1603;
                this.oC_ShortestPathPattern();
                }
                break;
            case 9:
                this.enterOuterAlt(localContext, 9);
                {
                this.state = 1604;
                this.oC_Quantifier();
                }
                break;
            case 10:
                this.enterOuterAlt(localContext, 10);
                {
                this.state = 1605;
                this.oC_PatternPredicate();
                }
                break;
            case 11:
                this.enterOuterAlt(localContext, 11);
                {
                this.state = 1606;
                this.oC_ParenthesizedExpression();
                }
                break;
            case 12:
                this.enterOuterAlt(localContext, 12);
                {
                this.state = 1607;
                this.oC_FunctionInvocation();
                }
                break;
            case 13:
                this.enterOuterAlt(localContext, 13);
                {
                this.state = 1608;
                this.oC_ExistentialSubquery();
                }
                break;
            case 14:
                this.enterOuterAlt(localContext, 14);
                {
                this.state = 1609;
                this.oC_Variable();
                this.state = 1614;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 282, this.context) ) {
                case 1:
                    {
                    this.state = 1611;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1610;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1613;
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
    public oC_CaseExpression(): OC_CaseExpressionContext {
        let localContext = new OC_CaseExpressionContext(this.context, this.state);
        this.enterRule(localContext, 172, CypherParser.RULE_oC_CaseExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1640;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 289, this.context) ) {
            case 1:
                {
                {
                this.state = 1618;
                this.match(CypherParser.CASE);
                this.state = 1623;
                this.errorHandler.sync(this);
                alternative = 1;
                do {
                    switch (alternative) {
                    case 1:
                        {
                        {
                        this.state = 1620;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1619;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1622;
                        this.oC_CaseAlternative();
                        }
                        }
                        break;
                    default:
                        throw new antlr.NoViableAltException(this);
                    }
                    this.state = 1625;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 285, this.context);
                } while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER);
                }
                }
                break;
            case 2:
                {
                {
                this.state = 1627;
                this.match(CypherParser.CASE);
                this.state = 1629;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1628;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1631;
                this.oC_Expression();
                this.state = 1636;
                this.errorHandler.sync(this);
                alternative = 1;
                do {
                    switch (alternative) {
                    case 1:
                        {
                        {
                        this.state = 1633;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1632;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1635;
                        this.oC_CaseAlternative();
                        }
                        }
                        break;
                    default:
                        throw new antlr.NoViableAltException(this);
                    }
                    this.state = 1638;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 288, this.context);
                } while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER);
                }
                }
                break;
            }
            this.state = 1650;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 292, this.context) ) {
            case 1:
                {
                this.state = 1643;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1642;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1645;
                this.match(CypherParser.ELSE);
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
                }
                break;
            }
            this.state = 1653;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1652;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1655;
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
        this.enterRule(localContext, 174, CypherParser.RULE_oC_CaseAlternative);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1657;
            this.match(CypherParser.WHEN);
            this.state = 1659;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1658;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1661;
            this.oC_Expression();
            this.state = 1663;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1662;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1665;
            this.match(CypherParser.THEN);
            this.state = 1667;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1666;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1669;
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
        this.enterRule(localContext, 176, CypherParser.RULE_oC_ListComprehension);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1671;
            this.match(CypherParser.T__12);
            this.state = 1673;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1672;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1675;
            this.oC_FilterExpression();
            this.state = 1684;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 300, this.context) ) {
            case 1:
                {
                this.state = 1677;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1676;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1679;
                this.match(CypherParser.T__6);
                this.state = 1681;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1680;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1683;
                this.oC_Expression();
                }
                break;
            }
            this.state = 1687;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1686;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1689;
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
        this.enterRule(localContext, 178, CypherParser.RULE_oC_PatternComprehension);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1691;
            this.match(CypherParser.T__12);
            this.state = 1693;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1692;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1703;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 58724255) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 276566019) !== 0) || ((((_la - 132)) & ~0x1F) === 0 && ((1 << (_la - 132)) & 159) !== 0)) {
                {
                this.state = 1695;
                this.oC_Variable();
                this.state = 1697;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1696;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1699;
                this.match(CypherParser.T__1);
                this.state = 1701;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1700;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1705;
            this.oC_RelationshipsPattern();
            this.state = 1707;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1706;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1713;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 83) {
                {
                this.state = 1709;
                this.oC_Where();
                this.state = 1711;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1710;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1715;
            this.match(CypherParser.T__6);
            this.state = 1717;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
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
            if (_la === 140) {
                {
                this.state = 1720;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1723;
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
        this.enterRule(localContext, 180, CypherParser.RULE_oC_Quantifier);
        let _la: number;
        try {
            this.state = 1781;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.ALL:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1725;
                this.match(CypherParser.ALL);
                this.state = 1727;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1726;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1729;
                this.match(CypherParser.T__3);
                this.state = 1731;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1730;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1733;
                this.oC_FilterExpression();
                this.state = 1735;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1734;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1737;
                this.match(CypherParser.T__5);
                }
                }
                break;
            case CypherParser.ANY:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1739;
                this.match(CypherParser.ANY);
                this.state = 1741;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1740;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1743;
                this.match(CypherParser.T__3);
                this.state = 1745;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1744;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1747;
                this.oC_FilterExpression();
                this.state = 1749;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1748;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1751;
                this.match(CypherParser.T__5);
                }
                }
                break;
            case CypherParser.NONE:
                this.enterOuterAlt(localContext, 3);
                {
                {
                this.state = 1753;
                this.match(CypherParser.NONE);
                this.state = 1755;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1754;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1757;
                this.match(CypherParser.T__3);
                this.state = 1759;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1758;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1761;
                this.oC_FilterExpression();
                this.state = 1763;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1762;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1765;
                this.match(CypherParser.T__5);
                }
                }
                break;
            case CypherParser.SINGLE:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 1767;
                this.match(CypherParser.SINGLE);
                this.state = 1769;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1768;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1771;
                this.match(CypherParser.T__3);
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
                this.oC_FilterExpression();
                this.state = 1777;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1776;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1779;
                this.match(CypherParser.T__5);
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
        this.enterRule(localContext, 182, CypherParser.RULE_oC_FilterExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1783;
            this.oC_IdInColl();
            this.state = 1788;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 325, this.context) ) {
            case 1:
                {
                this.state = 1785;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1784;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1787;
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
        this.enterRule(localContext, 184, CypherParser.RULE_oC_PatternPredicate);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1790;
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
        this.enterRule(localContext, 186, CypherParser.RULE_oC_ParenthesizedExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1792;
            this.match(CypherParser.T__3);
            this.state = 1794;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1793;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1796;
            this.oC_Expression();
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
            this.match(CypherParser.T__5);
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
        this.enterRule(localContext, 188, CypherParser.RULE_oC_IdInColl);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1802;
            this.oC_Variable();
            this.state = 1803;
            this.match(CypherParser.SP);
            this.state = 1804;
            this.match(CypherParser.IN);
            this.state = 1805;
            this.match(CypherParser.SP);
            this.state = 1806;
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
        this.enterRule(localContext, 190, CypherParser.RULE_oC_ReduceExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1808;
            this.match(CypherParser.REDUCE);
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
            this.match(CypherParser.T__3);
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
            this.oC_Variable();
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
            this.match(CypherParser.T__1);
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
            this.oC_Expression();
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
            this.match(CypherParser.T__4);
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
            this.oC_IdInColl();
            this.state = 1834;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1833;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1836;
            this.match(CypherParser.T__6);
            this.state = 1838;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1837;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1840;
            this.oC_Expression();
            this.state = 1842;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1841;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1844;
            this.match(CypherParser.T__5);
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
        this.enterRule(localContext, 192, CypherParser.RULE_oC_FunctionInvocation);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1846;
            this.oC_FunctionName();
            this.state = 1848;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1847;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1850;
            this.match(CypherParser.T__3);
            this.state = 1852;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1851;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1858;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 74) {
                {
                this.state = 1854;
                this.match(CypherParser.DISTINCT);
                this.state = 1856;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1855;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1877;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 73408784) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 58724319) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 536623139) !== 0) || ((((_la - 119)) & ~0x1F) === 0 && ((1 << (_la - 119)) & 1302535) !== 0)) {
                {
                this.state = 1860;
                this.oC_Expression();
                this.state = 1862;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1861;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1874;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 5) {
                    {
                    {
                    this.state = 1864;
                    this.match(CypherParser.T__4);
                    this.state = 1866;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1865;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1868;
                    this.oC_Expression();
                    this.state = 1870;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1869;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 1876;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            this.state = 1879;
            this.match(CypherParser.T__5);
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
        this.enterRule(localContext, 194, CypherParser.RULE_oC_FunctionName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1881;
            this.oC_Namespace();
            this.state = 1882;
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
        this.enterRule(localContext, 196, CypherParser.RULE_oC_ExistentialSubquery);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1884;
            this.match(CypherParser.EXISTS);
            this.state = 1886;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1885;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1888;
            this.match(CypherParser.T__7);
            this.state = 1890;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1889;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1908;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 352, this.context) ) {
            case 1:
                {
                this.state = 1892;
                this.oC_RegularQuery();
                }
                break;
            case 2:
                {
                {
                this.state = 1897;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                do {
                    {
                    {
                    this.state = 1893;
                    this.oC_ReadingClause();
                    this.state = 1895;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 348, this.context) ) {
                    case 1:
                        {
                        this.state = 1894;
                        this.match(CypherParser.SP);
                        }
                        break;
                    }
                    }
                    }
                    this.state = 1899;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                } while (((((_la - 53)) & ~0x1F) === 0 && ((1 << (_la - 53)) & 131521) !== 0));
                }
                }
                break;
            case 3:
                {
                {
                this.state = 1901;
                this.oC_Pattern();
                this.state = 1906;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 351, this.context) ) {
                case 1:
                    {
                    this.state = 1903;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1902;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1905;
                    this.oC_Where();
                    }
                    break;
                }
                }
                }
                break;
            }
            this.state = 1911;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1910;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1913;
            this.match(CypherParser.T__8);
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
        this.enterRule(localContext, 198, CypherParser.RULE_oC_ExplicitProcedureInvocation);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1915;
            this.oC_ProcedureName();
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
            this.match(CypherParser.T__3);
            this.state = 1921;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1920;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1940;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 73408784) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 58724319) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 536623139) !== 0) || ((((_la - 119)) & ~0x1F) === 0 && ((1 << (_la - 119)) & 1302535) !== 0)) {
                {
                this.state = 1923;
                this.oC_Expression();
                this.state = 1925;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1924;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1937;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 5) {
                    {
                    {
                    this.state = 1927;
                    this.match(CypherParser.T__4);
                    this.state = 1929;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1928;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1931;
                    this.oC_Expression();
                    this.state = 1933;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1932;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 1939;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            this.state = 1942;
            this.match(CypherParser.T__5);
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
        this.enterRule(localContext, 200, CypherParser.RULE_oC_ImplicitProcedureInvocation);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1944;
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
        this.enterRule(localContext, 202, CypherParser.RULE_oC_ProcedureResultField);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1946;
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
        this.enterRule(localContext, 204, CypherParser.RULE_oC_ProcedureName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1948;
            this.oC_Namespace();
            this.state = 1949;
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
        this.enterRule(localContext, 206, CypherParser.RULE_oC_Namespace);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1956;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 361, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1951;
                    this.oC_SymbolicName();
                    this.state = 1952;
                    this.match(CypherParser.T__11);
                    }
                    }
                }
                this.state = 1958;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 361, this.context);
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
        this.enterRule(localContext, 208, CypherParser.RULE_oC_Variable);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1959;
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
        this.enterRule(localContext, 210, CypherParser.RULE_oC_Literal);
        try {
            this.state = 1967;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.TRUE:
            case CypherParser.FALSE:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1961;
                this.oC_BooleanLiteral();
                }
                break;
            case CypherParser.NULL:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1962;
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
                this.state = 1963;
                this.oC_NumberLiteral();
                }
                break;
            case CypherParser.StringLiteral:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 1964;
                this.match(CypherParser.StringLiteral);
                }
                break;
            case CypherParser.T__12:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 1965;
                this.oC_ListLiteral();
                }
                break;
            case CypherParser.T__7:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 1966;
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
        this.enterRule(localContext, 212, CypherParser.RULE_oC_BooleanLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1969;
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
        this.enterRule(localContext, 214, CypherParser.RULE_oC_NumberLiteral);
        try {
            this.state = 1973;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.ExponentDecimalReal:
            case CypherParser.RegularDecimalReal:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1971;
                this.oC_DoubleLiteral();
                }
                break;
            case CypherParser.HexInteger:
            case CypherParser.DecimalInteger:
            case CypherParser.OctalInteger:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1972;
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
        this.enterRule(localContext, 216, CypherParser.RULE_oC_IntegerLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1975;
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
        this.enterRule(localContext, 218, CypherParser.RULE_oC_DoubleLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1977;
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
        this.enterRule(localContext, 220, CypherParser.RULE_oC_ListLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1979;
            this.match(CypherParser.T__12);
            this.state = 1981;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1980;
                this.match(CypherParser.SP);
                }
            }

            this.state = 2000;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 73408784) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 58724319) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 536623139) !== 0) || ((((_la - 119)) & ~0x1F) === 0 && ((1 << (_la - 119)) & 1302535) !== 0)) {
                {
                this.state = 1983;
                this.oC_Expression();
                this.state = 1985;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1984;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1997;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 5) {
                    {
                    {
                    this.state = 1987;
                    this.match(CypherParser.T__4);
                    this.state = 1989;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1988;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1991;
                    this.oC_Expression();
                    this.state = 1993;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1992;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 1999;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            this.state = 2002;
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
        this.enterRule(localContext, 222, CypherParser.RULE_oC_MapLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 2004;
            this.match(CypherParser.T__7);
            this.state = 2006;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 2005;
                this.match(CypherParser.SP);
                }
            }

            this.state = 2041;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 4294967295) !== 0) || ((((_la - 78)) & ~0x1F) === 0 && ((1 << (_la - 78)) & 2147483647) !== 0) || ((((_la - 112)) & ~0x1F) === 0 && ((1 << (_la - 112)) & 167770113) !== 0)) {
                {
                this.state = 2008;
                this.oC_PropertyKeyName();
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
                this.match(CypherParser.T__2);
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
                this.oC_Expression();
                this.state = 2018;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 2017;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 2038;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 5) {
                    {
                    {
                    this.state = 2020;
                    this.match(CypherParser.T__4);
                    this.state = 2022;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 2021;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 2024;
                    this.oC_PropertyKeyName();
                    this.state = 2026;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 2025;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 2028;
                    this.match(CypherParser.T__2);
                    this.state = 2030;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 2029;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 2032;
                    this.oC_Expression();
                    this.state = 2034;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 2033;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 2040;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            this.state = 2043;
            this.match(CypherParser.T__8);
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
        this.enterRule(localContext, 224, CypherParser.RULE_oC_PropertyKeyName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 2045;
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
        this.enterRule(localContext, 226, CypherParser.RULE_oC_Parameter);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 2047;
            this.match(CypherParser.T__25);
            this.state = 2050;
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
                this.state = 2048;
                this.oC_SymbolicName();
                }
                break;
            case CypherParser.DecimalInteger:
                {
                this.state = 2049;
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
        this.enterRule(localContext, 228, CypherParser.RULE_oC_SchemaName);
        try {
            this.state = 2054;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 381, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 2052;
                this.oC_SymbolicName();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 2053;
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
        this.enterRule(localContext, 230, CypherParser.RULE_oC_ReservedWord);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 2056;
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
        this.enterRule(localContext, 232, CypherParser.RULE_oC_SymbolicName);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 2058;
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
    public oC_LeftArrowHead(): OC_LeftArrowHeadContext {
        let localContext = new OC_LeftArrowHeadContext(this.context, this.state);
        this.enterRule(localContext, 234, CypherParser.RULE_oC_LeftArrowHead);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 2060;
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
            this.state = 2062;
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
            this.state = 2064;
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
        4,1,142,2067,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,
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
        3,0,242,8,0,1,0,1,0,1,0,5,0,247,8,0,10,0,12,0,250,9,0,1,0,3,0,253,
        8,0,5,0,255,8,0,10,0,12,0,258,9,0,1,0,1,0,3,0,262,8,0,1,0,3,0,265,
        8,0,1,0,3,0,268,8,0,1,0,1,0,1,1,1,1,3,1,274,8,1,1,1,1,1,3,1,278,
        8,1,1,1,1,1,1,2,1,2,1,3,1,3,1,3,3,3,287,8,3,1,4,1,4,1,4,1,4,3,4,
        293,8,4,1,5,1,5,1,5,1,5,1,5,1,5,3,5,301,8,5,1,5,1,5,3,5,305,8,5,
        1,5,1,5,3,5,309,8,5,1,5,1,5,3,5,313,8,5,1,5,1,5,3,5,317,8,5,1,5,
        1,5,3,5,321,8,5,1,5,3,5,324,8,5,1,5,1,5,1,5,1,5,3,5,330,8,5,1,5,
        1,5,3,5,334,8,5,1,5,1,5,3,5,338,8,5,1,5,1,5,3,5,342,8,5,1,5,1,5,
        1,5,1,5,1,5,1,5,3,5,350,8,5,1,5,1,5,3,5,354,8,5,1,5,1,5,3,5,358,
        8,5,1,5,1,5,3,5,362,8,5,1,5,1,5,3,5,366,8,5,1,6,1,6,1,6,1,6,1,6,
        1,6,3,6,374,8,6,1,6,1,6,3,6,378,8,6,1,6,1,6,3,6,382,8,6,1,6,1,6,
        3,6,386,8,6,1,6,1,6,1,6,1,6,1,6,1,6,3,6,394,8,6,1,6,1,6,3,6,398,
        8,6,1,6,1,6,3,6,402,8,6,1,6,1,6,3,6,406,8,6,1,6,1,6,1,6,1,6,1,6,
        1,6,3,6,414,8,6,1,6,1,6,3,6,418,8,6,1,6,1,6,3,6,422,8,6,1,6,1,6,
        3,6,426,8,6,1,6,1,6,3,6,430,8,6,1,7,1,7,1,8,1,8,3,8,436,8,8,1,9,
        1,9,3,9,440,8,9,1,9,1,9,3,9,444,8,9,1,9,1,9,3,9,448,8,9,1,9,5,9,
        451,8,9,10,9,12,9,454,9,9,1,9,3,9,457,8,9,1,9,1,9,1,10,1,10,1,10,
        1,10,1,10,1,10,3,10,467,8,10,1,10,1,10,1,10,1,10,1,10,1,10,3,10,
        475,8,10,1,10,1,10,3,10,479,8,10,1,10,5,10,482,8,10,10,10,12,10,
        485,9,10,1,10,1,10,3,10,489,8,10,1,11,1,11,1,11,1,11,1,11,1,11,3,
        11,497,8,11,1,11,1,11,1,11,1,11,1,11,1,11,3,11,505,8,11,1,11,1,11,
        3,11,509,8,11,1,11,5,11,512,8,11,10,11,12,11,515,9,11,1,11,1,11,
        3,11,519,8,11,1,12,1,12,1,12,1,12,1,12,1,12,1,12,1,12,3,12,529,8,
        12,1,13,1,13,3,13,533,8,13,1,13,5,13,536,8,13,10,13,12,13,539,9,
        13,1,14,1,14,1,14,1,14,3,14,545,8,14,1,14,1,14,1,14,3,14,550,8,14,
        1,14,3,14,553,8,14,1,15,1,15,3,15,557,8,15,1,16,1,16,3,16,561,8,
        16,5,16,563,8,16,10,16,12,16,566,9,16,1,16,1,16,1,16,3,16,571,8,
        16,5,16,573,8,16,10,16,12,16,576,9,16,1,16,1,16,3,16,580,8,16,1,
        16,5,16,583,8,16,10,16,12,16,586,9,16,1,16,3,16,589,8,16,1,16,3,
        16,592,8,16,3,16,594,8,16,1,17,1,17,3,17,598,8,17,5,17,600,8,17,
        10,17,12,17,603,9,17,1,17,1,17,3,17,607,8,17,5,17,609,8,17,10,17,
        12,17,612,9,17,1,17,1,17,3,17,616,8,17,4,17,618,8,17,11,17,12,17,
        619,1,17,1,17,1,18,1,18,1,18,1,18,1,18,1,18,1,18,3,18,631,8,18,1,
        19,1,19,1,19,1,19,1,19,3,19,638,8,19,1,20,1,20,1,20,1,20,1,20,1,
        20,1,20,3,20,647,8,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,
        20,1,20,1,20,1,20,3,20,661,8,20,1,21,1,21,3,21,665,8,21,1,21,1,21,
        3,21,669,8,21,1,21,1,21,1,21,1,21,1,21,1,21,3,21,677,8,21,1,21,1,
        21,3,21,681,8,21,1,21,4,21,684,8,21,11,21,12,21,685,1,21,3,21,689,
        8,21,1,21,1,21,1,22,1,22,3,22,695,8,22,1,22,1,22,3,22,699,8,22,1,
        22,1,22,3,22,703,8,22,1,22,1,22,1,23,1,23,3,23,709,8,23,1,23,1,23,
        3,23,713,8,23,1,23,1,23,3,23,717,8,23,1,23,3,23,720,8,23,1,24,1,
        24,3,24,724,8,24,1,24,1,24,1,24,1,24,1,24,1,24,1,25,1,25,3,25,734,
        8,25,1,25,1,25,1,25,5,25,739,8,25,10,25,12,25,742,9,25,1,26,1,26,
        1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,3,26,754,8,26,1,27,1,27,
        3,27,758,8,27,1,27,1,27,1,28,1,28,3,28,764,8,28,1,28,1,28,3,28,768,
        8,28,1,28,1,28,3,28,772,8,28,1,28,5,28,775,8,28,10,28,12,28,778,
        9,28,1,29,1,29,3,29,782,8,29,1,29,1,29,3,29,786,8,29,1,29,1,29,1,
        29,1,29,3,29,792,8,29,1,29,1,29,3,29,796,8,29,1,29,1,29,1,29,1,29,
        3,29,802,8,29,1,29,1,29,3,29,806,8,29,1,29,1,29,1,29,1,29,3,29,812,
        8,29,1,29,1,29,3,29,816,8,29,1,30,1,30,3,30,820,8,30,1,30,1,30,3,
        30,824,8,30,1,30,1,30,3,30,828,8,30,1,30,1,30,3,30,832,8,30,1,30,
        5,30,835,8,30,10,30,12,30,838,9,30,1,31,1,31,1,31,1,31,3,31,844,
        8,31,1,31,1,31,3,31,848,8,31,1,31,5,31,851,8,31,10,31,12,31,854,
        9,31,1,32,1,32,1,32,1,32,3,32,860,8,32,1,33,1,33,1,33,1,33,3,33,
        866,8,33,1,33,1,33,1,33,3,33,871,8,33,1,34,1,34,1,34,1,34,3,34,877,
        8,34,1,34,3,34,880,8,34,1,34,1,34,1,34,1,34,3,34,886,8,34,3,34,888,
        8,34,1,35,1,35,3,35,892,8,35,1,35,1,35,3,35,896,8,35,1,35,5,35,899,
        8,35,10,35,12,35,902,9,35,1,35,3,35,905,8,35,1,35,3,35,908,8,35,
        1,36,1,36,1,36,1,36,1,36,3,36,915,8,36,1,36,1,36,1,37,1,37,1,37,
        3,37,922,8,37,1,37,3,37,925,8,37,1,38,1,38,1,38,1,39,3,39,931,8,
        39,1,39,3,39,934,8,39,1,39,1,39,1,39,1,39,3,39,940,8,39,1,39,1,39,
        3,39,944,8,39,1,39,1,39,3,39,948,8,39,1,40,1,40,3,40,952,8,40,1,
        40,1,40,3,40,956,8,40,1,40,5,40,959,8,40,10,40,12,40,962,9,40,1,
        40,1,40,3,40,966,8,40,1,40,1,40,3,40,970,8,40,1,40,5,40,973,8,40,
        10,40,12,40,976,9,40,3,40,978,8,40,1,41,1,41,1,41,1,41,1,41,1,41,
        1,41,3,41,987,8,41,1,42,1,42,3,42,991,8,42,1,42,1,42,3,42,995,8,
        42,1,42,1,42,3,42,999,8,42,1,42,5,42,1002,8,42,10,42,12,42,1005,
        9,42,3,42,1007,8,42,1,42,3,42,1010,8,42,1,42,1,42,1,43,1,43,3,43,
        1016,8,43,1,43,1,43,1,43,3,43,1021,8,43,1,43,1,43,1,43,3,43,1026,
        8,43,1,43,1,43,3,43,1030,8,43,1,43,1,43,1,43,3,43,1035,8,43,1,44,
        1,44,1,44,1,44,1,44,1,44,1,44,3,44,1044,8,44,1,44,5,44,1047,8,44,
        10,44,12,44,1050,9,44,1,45,1,45,1,45,1,45,1,46,1,46,1,46,1,46,1,
        47,1,47,3,47,1062,8,47,1,47,3,47,1065,8,47,1,48,1,48,1,48,1,48,1,
        49,1,49,3,49,1073,8,49,1,49,1,49,3,49,1077,8,49,1,49,5,49,1080,8,
        49,10,49,12,49,1083,9,49,1,50,1,50,3,50,1087,8,50,1,50,1,50,3,50,
        1091,8,50,1,50,1,50,1,50,3,50,1096,8,50,1,51,1,51,3,51,1100,8,51,
        1,52,1,52,3,52,1104,8,52,1,52,1,52,3,52,1108,8,52,1,52,1,52,3,52,
        1112,8,52,1,52,1,52,1,53,1,53,3,53,1118,8,53,1,53,5,53,1121,8,53,
        10,53,12,53,1124,9,53,1,53,1,53,1,53,1,53,3,53,1130,8,53,1,54,1,
        54,3,54,1134,8,54,1,54,4,54,1137,8,54,11,54,12,54,1138,1,55,1,55,
        3,55,1143,8,55,1,55,1,55,3,55,1147,8,55,3,55,1149,8,55,1,55,1,55,
        3,55,1153,8,55,3,55,1155,8,55,1,55,1,55,3,55,1159,8,55,3,55,1161,
        8,55,1,55,1,55,1,56,1,56,3,56,1167,8,56,1,56,1,56,1,57,1,57,3,57,
        1173,8,57,1,57,1,57,3,57,1177,8,57,1,57,3,57,1180,8,57,1,57,3,57,
        1183,8,57,1,57,1,57,3,57,1187,8,57,1,57,1,57,1,57,1,57,3,57,1193,
        8,57,1,57,1,57,3,57,1197,8,57,1,57,3,57,1200,8,57,1,57,3,57,1203,
        8,57,1,57,1,57,1,57,1,57,3,57,1209,8,57,1,57,3,57,1212,8,57,1,57,
        3,57,1215,8,57,1,57,1,57,3,57,1219,8,57,1,57,1,57,1,57,1,57,3,57,
        1225,8,57,1,57,3,57,1228,8,57,1,57,3,57,1231,8,57,1,57,1,57,3,57,
        1235,8,57,1,58,1,58,3,58,1239,8,58,1,58,1,58,3,58,1243,8,58,3,58,
        1245,8,58,1,58,1,58,3,58,1249,8,58,3,58,1251,8,58,1,58,3,58,1254,
        8,58,1,58,1,58,3,58,1258,8,58,3,58,1260,8,58,1,58,1,58,1,59,1,59,
        3,59,1266,8,59,1,60,1,60,3,60,1270,8,60,1,60,1,60,3,60,1274,8,60,
        1,60,1,60,3,60,1278,8,60,1,60,3,60,1281,8,60,1,60,5,60,1284,8,60,
        10,60,12,60,1287,9,60,1,61,1,61,3,61,1291,8,61,1,61,5,61,1294,8,
        61,10,61,12,61,1297,9,61,1,62,1,62,3,62,1301,8,62,1,62,1,62,1,63,
        1,63,3,63,1307,8,63,1,63,1,63,3,63,1311,8,63,3,63,1313,8,63,1,63,
        1,63,3,63,1317,8,63,1,63,1,63,3,63,1321,8,63,3,63,1323,8,63,3,63,
        1325,8,63,1,64,1,64,1,65,1,65,1,66,1,66,3,66,1333,8,66,1,66,4,66,
        1336,8,66,11,66,12,66,1337,1,67,1,67,1,68,1,68,1,68,1,68,1,68,5,
        68,1347,8,68,10,68,12,68,1350,9,68,1,69,1,69,1,69,1,69,1,69,5,69,
        1357,8,69,10,69,12,69,1360,9,69,1,70,1,70,1,70,1,70,1,70,5,70,1367,
        8,70,10,70,12,70,1370,9,70,1,71,1,71,3,71,1374,8,71,5,71,1376,8,
        71,10,71,12,71,1379,9,71,1,71,1,71,1,72,1,72,3,72,1385,8,72,1,72,
        5,72,1388,8,72,10,72,12,72,1391,9,72,1,73,1,73,3,73,1395,8,73,1,
        73,1,73,1,73,3,73,1400,8,73,1,73,1,73,1,73,3,73,1405,8,73,1,73,1,
        73,1,73,3,73,1410,8,73,1,73,1,73,1,73,3,73,1415,8,73,1,73,1,73,1,
        73,3,73,1420,8,73,1,73,3,73,1423,8,73,1,74,1,74,1,74,1,74,5,74,1429,
        8,74,10,74,12,74,1432,9,74,1,75,1,75,1,75,1,75,1,75,1,75,1,75,1,
        75,1,75,1,75,3,75,1444,8,75,1,75,3,75,1447,8,75,1,75,1,75,1,76,1,
        76,1,76,3,76,1454,8,76,1,76,1,76,1,77,1,77,1,77,1,77,1,77,1,77,1,
        77,1,77,1,77,1,77,3,77,1468,8,77,1,78,1,78,3,78,1472,8,78,1,78,1,
        78,3,78,1476,8,78,1,78,1,78,3,78,1480,8,78,1,78,1,78,3,78,1484,8,
        78,1,78,5,78,1487,8,78,10,78,12,78,1490,9,78,1,79,1,79,3,79,1494,
        8,79,1,79,1,79,3,79,1498,8,79,1,79,1,79,3,79,1502,8,79,1,79,1,79,
        3,79,1506,8,79,1,79,1,79,3,79,1510,8,79,1,79,1,79,3,79,1514,8,79,
        1,79,5,79,1517,8,79,10,79,12,79,1520,9,79,1,80,1,80,3,80,1524,8,
        80,1,80,1,80,3,80,1528,8,80,1,80,5,80,1531,8,80,10,80,12,80,1534,
        9,80,1,81,1,81,1,81,3,81,1539,8,81,1,81,3,81,1542,8,81,1,82,1,82,
        3,82,1546,8,82,1,82,1,82,3,82,1550,8,82,1,82,5,82,1553,8,82,10,82,
        12,82,1556,9,82,1,82,3,82,1559,8,82,1,82,3,82,1562,8,82,1,83,1,83,
        1,83,1,83,1,83,1,83,3,83,1570,8,83,1,83,1,83,3,83,1574,8,83,1,83,
        3,83,1577,8,83,1,84,1,84,3,84,1581,8,84,1,84,1,84,1,85,1,85,1,85,
        1,85,1,85,3,85,1590,8,85,1,85,1,85,3,85,1594,8,85,1,85,1,85,3,85,
        1598,8,85,1,85,1,85,1,85,1,85,1,85,1,85,1,85,1,85,1,85,1,85,1,85,
        1,85,3,85,1612,8,85,1,85,3,85,1615,8,85,3,85,1617,8,85,1,86,1,86,
        3,86,1621,8,86,1,86,4,86,1624,8,86,11,86,12,86,1625,1,86,1,86,3,
        86,1630,8,86,1,86,1,86,3,86,1634,8,86,1,86,4,86,1637,8,86,11,86,
        12,86,1638,3,86,1641,8,86,1,86,3,86,1644,8,86,1,86,1,86,3,86,1648,
        8,86,1,86,3,86,1651,8,86,1,86,3,86,1654,8,86,1,86,1,86,1,87,1,87,
        3,87,1660,8,87,1,87,1,87,3,87,1664,8,87,1,87,1,87,3,87,1668,8,87,
        1,87,1,87,1,88,1,88,3,88,1674,8,88,1,88,1,88,3,88,1678,8,88,1,88,
        1,88,3,88,1682,8,88,1,88,3,88,1685,8,88,1,88,3,88,1688,8,88,1,88,
        1,88,1,89,1,89,3,89,1694,8,89,1,89,1,89,3,89,1698,8,89,1,89,1,89,
        3,89,1702,8,89,3,89,1704,8,89,1,89,1,89,3,89,1708,8,89,1,89,1,89,
        3,89,1712,8,89,3,89,1714,8,89,1,89,1,89,3,89,1718,8,89,1,89,1,89,
        3,89,1722,8,89,1,89,1,89,1,90,1,90,3,90,1728,8,90,1,90,1,90,3,90,
        1732,8,90,1,90,1,90,3,90,1736,8,90,1,90,1,90,1,90,1,90,3,90,1742,
        8,90,1,90,1,90,3,90,1746,8,90,1,90,1,90,3,90,1750,8,90,1,90,1,90,
        1,90,1,90,3,90,1756,8,90,1,90,1,90,3,90,1760,8,90,1,90,1,90,3,90,
        1764,8,90,1,90,1,90,1,90,1,90,3,90,1770,8,90,1,90,1,90,3,90,1774,
        8,90,1,90,1,90,3,90,1778,8,90,1,90,1,90,3,90,1782,8,90,1,91,1,91,
        3,91,1786,8,91,1,91,3,91,1789,8,91,1,92,1,92,1,93,1,93,3,93,1795,
        8,93,1,93,1,93,3,93,1799,8,93,1,93,1,93,1,94,1,94,1,94,1,94,1,94,
        1,94,1,95,1,95,3,95,1811,8,95,1,95,1,95,3,95,1815,8,95,1,95,1,95,
        3,95,1819,8,95,1,95,1,95,3,95,1823,8,95,1,95,1,95,3,95,1827,8,95,
        1,95,1,95,3,95,1831,8,95,1,95,1,95,3,95,1835,8,95,1,95,1,95,3,95,
        1839,8,95,1,95,1,95,3,95,1843,8,95,1,95,1,95,1,96,1,96,3,96,1849,
        8,96,1,96,1,96,3,96,1853,8,96,1,96,1,96,3,96,1857,8,96,3,96,1859,
        8,96,1,96,1,96,3,96,1863,8,96,1,96,1,96,3,96,1867,8,96,1,96,1,96,
        3,96,1871,8,96,5,96,1873,8,96,10,96,12,96,1876,9,96,3,96,1878,8,
        96,1,96,1,96,1,97,1,97,1,97,1,98,1,98,3,98,1887,8,98,1,98,1,98,3,
        98,1891,8,98,1,98,1,98,1,98,3,98,1896,8,98,4,98,1898,8,98,11,98,
        12,98,1899,1,98,1,98,3,98,1904,8,98,1,98,3,98,1907,8,98,3,98,1909,
        8,98,1,98,3,98,1912,8,98,1,98,1,98,1,99,1,99,3,99,1918,8,99,1,99,
        1,99,3,99,1922,8,99,1,99,1,99,3,99,1926,8,99,1,99,1,99,3,99,1930,
        8,99,1,99,1,99,3,99,1934,8,99,5,99,1936,8,99,10,99,12,99,1939,9,
        99,3,99,1941,8,99,1,99,1,99,1,100,1,100,1,101,1,101,1,102,1,102,
        1,102,1,103,1,103,1,103,5,103,1955,8,103,10,103,12,103,1958,9,103,
        1,104,1,104,1,105,1,105,1,105,1,105,1,105,1,105,3,105,1968,8,105,
        1,106,1,106,1,107,1,107,3,107,1974,8,107,1,108,1,108,1,109,1,109,
        1,110,1,110,3,110,1982,8,110,1,110,1,110,3,110,1986,8,110,1,110,
        1,110,3,110,1990,8,110,1,110,1,110,3,110,1994,8,110,5,110,1996,8,
        110,10,110,12,110,1999,9,110,3,110,2001,8,110,1,110,1,110,1,111,
        1,111,3,111,2007,8,111,1,111,1,111,3,111,2011,8,111,1,111,1,111,
        3,111,2015,8,111,1,111,1,111,3,111,2019,8,111,1,111,1,111,3,111,
        2023,8,111,1,111,1,111,3,111,2027,8,111,1,111,1,111,3,111,2031,8,
        111,1,111,1,111,3,111,2035,8,111,5,111,2037,8,111,10,111,12,111,
        2040,9,111,3,111,2042,8,111,1,111,1,111,1,112,1,112,1,113,1,113,
        1,113,3,113,2051,8,113,1,114,1,114,3,114,2055,8,114,1,115,1,115,
        1,116,1,116,1,117,1,117,1,118,1,118,1,119,1,119,1,119,0,0,120,0,
        2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,
        48,50,52,54,56,58,60,62,64,66,68,70,72,74,76,78,80,82,84,86,88,90,
        92,94,96,98,100,102,104,106,108,110,112,114,116,118,120,122,124,
        126,128,130,132,134,136,138,140,142,144,146,148,150,152,154,156,
        158,160,162,164,166,168,170,172,174,176,178,180,182,184,186,188,
        190,192,194,196,198,200,202,204,206,208,210,212,214,216,218,220,
        222,224,226,228,230,232,234,236,238,0,12,1,0,48,49,1,0,79,82,1,0,
        84,85,1,0,21,22,1,0,107,108,1,0,109,111,1,0,119,120,7,0,51,52,58,
        69,72,83,86,95,97,101,106,108,123,132,9,0,46,50,53,57,69,71,84,85,
        96,96,102,106,112,112,132,136,139,139,2,0,17,17,27,30,2,0,18,18,
        31,34,2,0,22,22,35,45,2373,0,241,1,0,0,0,2,271,1,0,0,0,4,281,1,0,
        0,0,6,286,1,0,0,0,8,292,1,0,0,0,10,365,1,0,0,0,12,429,1,0,0,0,14,
        431,1,0,0,0,16,435,1,0,0,0,18,437,1,0,0,0,20,460,1,0,0,0,22,490,
        1,0,0,0,24,528,1,0,0,0,26,530,1,0,0,0,28,552,1,0,0,0,30,556,1,0,
        0,0,32,593,1,0,0,0,34,617,1,0,0,0,36,630,1,0,0,0,38,637,1,0,0,0,
        40,639,1,0,0,0,42,662,1,0,0,0,44,692,1,0,0,0,46,708,1,0,0,0,48,721,
        1,0,0,0,50,731,1,0,0,0,52,753,1,0,0,0,54,755,1,0,0,0,56,761,1,0,
        0,0,58,815,1,0,0,0,60,819,1,0,0,0,62,839,1,0,0,0,64,859,1,0,0,0,
        66,861,1,0,0,0,68,872,1,0,0,0,70,889,1,0,0,0,72,914,1,0,0,0,74,918,
        1,0,0,0,76,926,1,0,0,0,78,933,1,0,0,0,80,977,1,0,0,0,82,986,1,0,
        0,0,84,988,1,0,0,0,86,1034,1,0,0,0,88,1036,1,0,0,0,90,1051,1,0,0,
        0,92,1055,1,0,0,0,94,1059,1,0,0,0,96,1066,1,0,0,0,98,1070,1,0,0,
        0,100,1095,1,0,0,0,102,1099,1,0,0,0,104,1101,1,0,0,0,106,1129,1,
        0,0,0,108,1131,1,0,0,0,110,1140,1,0,0,0,112,1164,1,0,0,0,114,1234,
        1,0,0,0,116,1236,1,0,0,0,118,1265,1,0,0,0,120,1267,1,0,0,0,122,1288,
        1,0,0,0,124,1298,1,0,0,0,126,1304,1,0,0,0,128,1326,1,0,0,0,130,1328,
        1,0,0,0,132,1330,1,0,0,0,134,1339,1,0,0,0,136,1341,1,0,0,0,138,1351,
        1,0,0,0,140,1361,1,0,0,0,142,1377,1,0,0,0,144,1382,1,0,0,0,146,1422,
        1,0,0,0,148,1424,1,0,0,0,150,1443,1,0,0,0,152,1450,1,0,0,0,154,1467,
        1,0,0,0,156,1469,1,0,0,0,158,1491,1,0,0,0,160,1521,1,0,0,0,162,1541,
        1,0,0,0,164,1543,1,0,0,0,166,1576,1,0,0,0,168,1578,1,0,0,0,170,1616,
        1,0,0,0,172,1640,1,0,0,0,174,1657,1,0,0,0,176,1671,1,0,0,0,178,1691,
        1,0,0,0,180,1781,1,0,0,0,182,1783,1,0,0,0,184,1790,1,0,0,0,186,1792,
        1,0,0,0,188,1802,1,0,0,0,190,1808,1,0,0,0,192,1846,1,0,0,0,194,1881,
        1,0,0,0,196,1884,1,0,0,0,198,1915,1,0,0,0,200,1944,1,0,0,0,202,1946,
        1,0,0,0,204,1948,1,0,0,0,206,1956,1,0,0,0,208,1959,1,0,0,0,210,1967,
        1,0,0,0,212,1969,1,0,0,0,214,1973,1,0,0,0,216,1975,1,0,0,0,218,1977,
        1,0,0,0,220,1979,1,0,0,0,222,2004,1,0,0,0,224,2045,1,0,0,0,226,2047,
        1,0,0,0,228,2054,1,0,0,0,230,2056,1,0,0,0,232,2058,1,0,0,0,234,2060,
        1,0,0,0,236,2062,1,0,0,0,238,2064,1,0,0,0,240,242,5,140,0,0,241,
        240,1,0,0,0,241,242,1,0,0,0,242,256,1,0,0,0,243,248,5,135,0,0,244,
        245,5,140,0,0,245,247,3,2,1,0,246,244,1,0,0,0,247,250,1,0,0,0,248,
        246,1,0,0,0,248,249,1,0,0,0,249,252,1,0,0,0,250,248,1,0,0,0,251,
        253,5,140,0,0,252,251,1,0,0,0,252,253,1,0,0,0,253,255,1,0,0,0,254,
        243,1,0,0,0,255,258,1,0,0,0,256,254,1,0,0,0,256,257,1,0,0,0,257,
        259,1,0,0,0,258,256,1,0,0,0,259,264,3,4,2,0,260,262,5,140,0,0,261,
        260,1,0,0,0,261,262,1,0,0,0,262,263,1,0,0,0,263,265,5,1,0,0,264,
        261,1,0,0,0,264,265,1,0,0,0,265,267,1,0,0,0,266,268,5,140,0,0,267,
        266,1,0,0,0,267,268,1,0,0,0,268,269,1,0,0,0,269,270,5,0,0,1,270,
        1,1,0,0,0,271,273,3,228,114,0,272,274,5,140,0,0,273,272,1,0,0,0,
        273,274,1,0,0,0,274,275,1,0,0,0,275,277,5,2,0,0,276,278,5,140,0,
        0,277,276,1,0,0,0,277,278,1,0,0,0,278,279,1,0,0,0,279,280,3,134,
        67,0,280,3,1,0,0,0,281,282,3,6,3,0,282,5,1,0,0,0,283,287,3,26,13,
        0,284,287,3,68,34,0,285,287,3,8,4,0,286,283,1,0,0,0,286,284,1,0,
        0,0,286,285,1,0,0,0,287,7,1,0,0,0,288,293,3,10,5,0,289,293,3,12,
        6,0,290,293,3,20,10,0,291,293,3,22,11,0,292,288,1,0,0,0,292,289,
        1,0,0,0,292,290,1,0,0,0,292,291,1,0,0,0,293,9,1,0,0,0,294,295,5,
        65,0,0,295,296,5,140,0,0,296,297,3,14,7,0,297,298,5,140,0,0,298,
        300,5,46,0,0,299,301,5,140,0,0,300,299,1,0,0,0,300,301,1,0,0,0,301,
        302,1,0,0,0,302,304,5,125,0,0,303,305,5,140,0,0,304,303,1,0,0,0,
        304,305,1,0,0,0,305,306,1,0,0,0,306,308,3,16,8,0,307,309,5,140,0,
        0,308,307,1,0,0,0,308,309,1,0,0,0,309,310,1,0,0,0,310,312,5,64,0,
        0,311,313,5,140,0,0,312,311,1,0,0,0,312,313,1,0,0,0,313,314,1,0,
        0,0,314,323,3,18,9,0,315,317,5,140,0,0,316,315,1,0,0,0,316,317,1,
        0,0,0,317,318,1,0,0,0,318,320,5,50,0,0,319,321,5,140,0,0,320,319,
        1,0,0,0,320,321,1,0,0,0,321,322,1,0,0,0,322,324,3,222,111,0,323,
        316,1,0,0,0,323,324,1,0,0,0,324,366,1,0,0,0,325,326,5,65,0,0,326,
        327,5,140,0,0,327,329,5,46,0,0,328,330,5,140,0,0,329,328,1,0,0,0,
        329,330,1,0,0,0,330,331,1,0,0,0,331,333,5,125,0,0,332,334,5,140,
        0,0,333,332,1,0,0,0,333,334,1,0,0,0,334,335,1,0,0,0,335,337,3,16,
        8,0,336,338,5,140,0,0,337,336,1,0,0,0,337,338,1,0,0,0,338,339,1,
        0,0,0,339,341,5,64,0,0,340,342,5,140,0,0,341,340,1,0,0,0,341,342,
        1,0,0,0,342,343,1,0,0,0,343,344,3,18,9,0,344,366,1,0,0,0,345,346,
        5,65,0,0,346,347,5,140,0,0,347,349,5,46,0,0,348,350,5,140,0,0,349,
        348,1,0,0,0,349,350,1,0,0,0,350,351,1,0,0,0,351,353,5,64,0,0,352,
        354,5,140,0,0,353,352,1,0,0,0,353,354,1,0,0,0,354,355,1,0,0,0,355,
        357,5,3,0,0,356,358,5,140,0,0,357,356,1,0,0,0,357,358,1,0,0,0,358,
        359,1,0,0,0,359,361,3,128,64,0,360,362,5,140,0,0,361,360,1,0,0,0,
        361,362,1,0,0,0,362,363,1,0,0,0,363,364,3,18,9,0,364,366,1,0,0,0,
        365,294,1,0,0,0,365,325,1,0,0,0,365,345,1,0,0,0,366,11,1,0,0,0,367,
        368,5,132,0,0,368,369,5,140,0,0,369,370,3,14,7,0,370,371,5,140,0,
        0,371,373,5,46,0,0,372,374,5,140,0,0,373,372,1,0,0,0,373,374,1,0,
        0,0,374,375,1,0,0,0,375,377,5,125,0,0,376,378,5,140,0,0,377,376,
        1,0,0,0,377,378,1,0,0,0,378,379,1,0,0,0,379,381,3,16,8,0,380,382,
        5,140,0,0,381,380,1,0,0,0,381,382,1,0,0,0,382,383,1,0,0,0,383,385,
        5,64,0,0,384,386,5,140,0,0,385,384,1,0,0,0,385,386,1,0,0,0,386,387,
        1,0,0,0,387,388,3,18,9,0,388,430,1,0,0,0,389,390,5,132,0,0,390,391,
        5,140,0,0,391,393,5,46,0,0,392,394,5,140,0,0,393,392,1,0,0,0,393,
        394,1,0,0,0,394,395,1,0,0,0,395,397,5,125,0,0,396,398,5,140,0,0,
        397,396,1,0,0,0,397,398,1,0,0,0,398,399,1,0,0,0,399,401,3,16,8,0,
        400,402,5,140,0,0,401,400,1,0,0,0,401,402,1,0,0,0,402,403,1,0,0,
        0,403,405,5,64,0,0,404,406,5,140,0,0,405,404,1,0,0,0,405,406,1,0,
        0,0,406,407,1,0,0,0,407,408,3,18,9,0,408,430,1,0,0,0,409,410,5,132,
        0,0,410,411,5,140,0,0,411,413,5,46,0,0,412,414,5,140,0,0,413,412,
        1,0,0,0,413,414,1,0,0,0,414,415,1,0,0,0,415,417,5,64,0,0,416,418,
        5,140,0,0,417,416,1,0,0,0,417,418,1,0,0,0,418,419,1,0,0,0,419,421,
        5,3,0,0,420,422,5,140,0,0,421,420,1,0,0,0,421,422,1,0,0,0,422,423,
        1,0,0,0,423,425,3,128,64,0,424,426,5,140,0,0,425,424,1,0,0,0,425,
        426,1,0,0,0,426,427,1,0,0,0,427,428,3,18,9,0,428,430,1,0,0,0,429,
        367,1,0,0,0,429,389,1,0,0,0,429,409,1,0,0,0,430,13,1,0,0,0,431,432,
        7,0,0,0,432,15,1,0,0,0,433,436,3,110,55,0,434,436,3,108,54,0,435,
        433,1,0,0,0,435,434,1,0,0,0,436,17,1,0,0,0,437,439,5,4,0,0,438,440,
        5,140,0,0,439,438,1,0,0,0,439,440,1,0,0,0,440,441,1,0,0,0,441,452,
        3,134,67,0,442,444,5,140,0,0,443,442,1,0,0,0,443,444,1,0,0,0,444,
        445,1,0,0,0,445,447,5,5,0,0,446,448,5,140,0,0,447,446,1,0,0,0,447,
        448,1,0,0,0,448,449,1,0,0,0,449,451,3,134,67,0,450,443,1,0,0,0,451,
        454,1,0,0,0,452,450,1,0,0,0,452,453,1,0,0,0,453,456,1,0,0,0,454,
        452,1,0,0,0,455,457,5,140,0,0,456,455,1,0,0,0,456,457,1,0,0,0,457,
        458,1,0,0,0,458,459,5,6,0,0,459,19,1,0,0,0,460,461,5,65,0,0,461,
        462,5,140,0,0,462,463,5,123,0,0,463,464,5,140,0,0,464,466,5,64,0,
        0,465,467,5,140,0,0,466,465,1,0,0,0,466,467,1,0,0,0,467,468,1,0,
        0,0,468,469,3,16,8,0,469,470,5,140,0,0,470,471,5,47,0,0,471,472,
        5,140,0,0,472,483,3,134,67,0,473,475,5,140,0,0,474,473,1,0,0,0,474,
        475,1,0,0,0,475,476,1,0,0,0,476,478,5,5,0,0,477,479,5,140,0,0,478,
        477,1,0,0,0,478,479,1,0,0,0,479,480,1,0,0,0,480,482,3,134,67,0,481,
        474,1,0,0,0,482,485,1,0,0,0,483,481,1,0,0,0,483,484,1,0,0,0,484,
        488,1,0,0,0,485,483,1,0,0,0,486,487,5,140,0,0,487,489,3,24,12,0,
        488,486,1,0,0,0,488,489,1,0,0,0,489,21,1,0,0,0,490,491,5,132,0,0,
        491,492,5,140,0,0,492,493,5,123,0,0,493,494,5,140,0,0,494,496,5,
        64,0,0,495,497,5,140,0,0,496,495,1,0,0,0,496,497,1,0,0,0,497,498,
        1,0,0,0,498,499,3,16,8,0,499,500,5,140,0,0,500,501,5,47,0,0,501,
        502,5,140,0,0,502,513,3,134,67,0,503,505,5,140,0,0,504,503,1,0,0,
        0,504,505,1,0,0,0,505,506,1,0,0,0,506,508,5,5,0,0,507,509,5,140,
        0,0,508,507,1,0,0,0,508,509,1,0,0,0,509,510,1,0,0,0,510,512,3,134,
        67,0,511,504,1,0,0,0,512,515,1,0,0,0,513,511,1,0,0,0,513,514,1,0,
        0,0,514,518,1,0,0,0,515,513,1,0,0,0,516,517,5,140,0,0,517,519,3,
        24,12,0,518,516,1,0,0,0,518,519,1,0,0,0,519,23,1,0,0,0,520,521,5,
        94,0,0,521,522,5,140,0,0,522,529,5,127,0,0,523,524,5,94,0,0,524,
        525,5,140,0,0,525,526,5,89,0,0,526,527,5,140,0,0,527,529,5,95,0,
        0,528,520,1,0,0,0,528,523,1,0,0,0,529,25,1,0,0,0,530,537,3,30,15,
        0,531,533,5,140,0,0,532,531,1,0,0,0,532,533,1,0,0,0,533,534,1,0,
        0,0,534,536,3,28,14,0,535,532,1,0,0,0,536,539,1,0,0,0,537,535,1,
        0,0,0,537,538,1,0,0,0,538,27,1,0,0,0,539,537,1,0,0,0,540,541,5,51,
        0,0,541,542,5,140,0,0,542,544,5,52,0,0,543,545,5,140,0,0,544,543,
        1,0,0,0,544,545,1,0,0,0,545,546,1,0,0,0,546,553,3,30,15,0,547,549,
        5,51,0,0,548,550,5,140,0,0,549,548,1,0,0,0,549,550,1,0,0,0,550,551,
        1,0,0,0,551,553,3,30,15,0,552,540,1,0,0,0,552,547,1,0,0,0,553,29,
        1,0,0,0,554,557,3,32,16,0,555,557,3,34,17,0,556,554,1,0,0,0,556,
        555,1,0,0,0,557,31,1,0,0,0,558,560,3,38,19,0,559,561,5,140,0,0,560,
        559,1,0,0,0,560,561,1,0,0,0,561,563,1,0,0,0,562,558,1,0,0,0,563,
        566,1,0,0,0,564,562,1,0,0,0,564,565,1,0,0,0,565,567,1,0,0,0,566,
        564,1,0,0,0,567,594,3,76,38,0,568,570,3,38,19,0,569,571,5,140,0,
        0,570,569,1,0,0,0,570,571,1,0,0,0,571,573,1,0,0,0,572,568,1,0,0,
        0,573,576,1,0,0,0,574,572,1,0,0,0,574,575,1,0,0,0,575,577,1,0,0,
        0,576,574,1,0,0,0,577,584,3,36,18,0,578,580,5,140,0,0,579,578,1,
        0,0,0,579,580,1,0,0,0,580,581,1,0,0,0,581,583,3,36,18,0,582,579,
        1,0,0,0,583,586,1,0,0,0,584,582,1,0,0,0,584,585,1,0,0,0,585,591,
        1,0,0,0,586,584,1,0,0,0,587,589,5,140,0,0,588,587,1,0,0,0,588,589,
        1,0,0,0,589,590,1,0,0,0,590,592,3,76,38,0,591,588,1,0,0,0,591,592,
        1,0,0,0,592,594,1,0,0,0,593,564,1,0,0,0,593,574,1,0,0,0,594,33,1,
        0,0,0,595,597,3,38,19,0,596,598,5,140,0,0,597,596,1,0,0,0,597,598,
        1,0,0,0,598,600,1,0,0,0,599,595,1,0,0,0,600,603,1,0,0,0,601,599,
        1,0,0,0,601,602,1,0,0,0,602,610,1,0,0,0,603,601,1,0,0,0,604,606,
        3,36,18,0,605,607,5,140,0,0,606,605,1,0,0,0,606,607,1,0,0,0,607,
        609,1,0,0,0,608,604,1,0,0,0,609,612,1,0,0,0,610,608,1,0,0,0,610,
        611,1,0,0,0,611,613,1,0,0,0,612,610,1,0,0,0,613,615,3,74,37,0,614,
        616,5,140,0,0,615,614,1,0,0,0,615,616,1,0,0,0,616,618,1,0,0,0,617,
        601,1,0,0,0,618,619,1,0,0,0,619,617,1,0,0,0,619,620,1,0,0,0,620,
        621,1,0,0,0,621,622,3,32,16,0,622,35,1,0,0,0,623,631,3,54,27,0,624,
        631,3,50,25,0,625,631,3,60,30,0,626,631,3,56,28,0,627,631,3,62,31,
        0,628,631,3,42,21,0,629,631,3,44,22,0,630,623,1,0,0,0,630,624,1,
        0,0,0,630,625,1,0,0,0,630,626,1,0,0,0,630,627,1,0,0,0,630,628,1,
        0,0,0,630,629,1,0,0,0,631,37,1,0,0,0,632,638,3,46,23,0,633,638,3,
        48,24,0,634,638,3,66,33,0,635,638,3,44,22,0,636,638,3,40,20,0,637,
        632,1,0,0,0,637,633,1,0,0,0,637,634,1,0,0,0,637,635,1,0,0,0,637,
        636,1,0,0,0,638,39,1,0,0,0,639,640,5,53,0,0,640,641,5,140,0,0,641,
        646,5,54,0,0,642,643,5,140,0,0,643,644,5,72,0,0,644,645,5,140,0,
        0,645,647,5,55,0,0,646,642,1,0,0,0,646,647,1,0,0,0,647,648,1,0,0,
        0,648,649,5,140,0,0,649,650,5,56,0,0,650,651,5,140,0,0,651,652,3,
        134,67,0,652,653,5,140,0,0,653,654,5,62,0,0,654,655,5,140,0,0,655,
        660,3,208,104,0,656,657,5,140,0,0,657,658,5,57,0,0,658,659,5,140,
        0,0,659,661,5,121,0,0,660,656,1,0,0,0,660,661,1,0,0,0,661,41,1,0,
        0,0,662,664,5,58,0,0,663,665,5,140,0,0,664,663,1,0,0,0,664,665,1,
        0,0,0,665,666,1,0,0,0,666,668,5,4,0,0,667,669,5,140,0,0,668,667,
        1,0,0,0,668,669,1,0,0,0,669,670,1,0,0,0,670,671,3,208,104,0,671,
        672,5,140,0,0,672,673,5,93,0,0,673,674,5,140,0,0,674,676,3,134,67,
        0,675,677,5,140,0,0,676,675,1,0,0,0,676,677,1,0,0,0,677,678,1,0,
        0,0,678,683,5,7,0,0,679,681,5,140,0,0,680,679,1,0,0,0,680,681,1,
        0,0,0,681,682,1,0,0,0,682,684,3,36,18,0,683,680,1,0,0,0,684,685,
        1,0,0,0,685,683,1,0,0,0,685,686,1,0,0,0,686,688,1,0,0,0,687,689,
        5,140,0,0,688,687,1,0,0,0,688,689,1,0,0,0,689,690,1,0,0,0,690,691,
        5,6,0,0,691,43,1,0,0,0,692,694,5,70,0,0,693,695,5,140,0,0,694,693,
        1,0,0,0,694,695,1,0,0,0,695,696,1,0,0,0,696,698,5,8,0,0,697,699,
        5,140,0,0,698,697,1,0,0,0,698,699,1,0,0,0,699,700,1,0,0,0,700,702,
        3,26,13,0,701,703,5,140,0,0,702,701,1,0,0,0,702,703,1,0,0,0,703,
        704,1,0,0,0,704,705,5,9,0,0,705,45,1,0,0,0,706,707,5,59,0,0,707,
        709,5,140,0,0,708,706,1,0,0,0,708,709,1,0,0,0,709,710,1,0,0,0,710,
        712,5,60,0,0,711,713,5,140,0,0,712,711,1,0,0,0,712,713,1,0,0,0,713,
        714,1,0,0,0,714,719,3,98,49,0,715,717,5,140,0,0,716,715,1,0,0,0,
        716,717,1,0,0,0,717,718,1,0,0,0,718,720,3,96,48,0,719,716,1,0,0,
        0,719,720,1,0,0,0,720,47,1,0,0,0,721,723,5,61,0,0,722,724,5,140,
        0,0,723,722,1,0,0,0,723,724,1,0,0,0,724,725,1,0,0,0,725,726,3,134,
        67,0,726,727,5,140,0,0,727,728,5,62,0,0,728,729,5,140,0,0,729,730,
        3,208,104,0,730,49,1,0,0,0,731,733,5,63,0,0,732,734,5,140,0,0,733,
        732,1,0,0,0,733,734,1,0,0,0,734,735,1,0,0,0,735,740,3,100,50,0,736,
        737,5,140,0,0,737,739,3,52,26,0,738,736,1,0,0,0,739,742,1,0,0,0,
        740,738,1,0,0,0,740,741,1,0,0,0,741,51,1,0,0,0,742,740,1,0,0,0,743,
        744,5,64,0,0,744,745,5,140,0,0,745,746,5,60,0,0,746,747,5,140,0,
        0,747,754,3,56,28,0,748,749,5,64,0,0,749,750,5,140,0,0,750,751,5,
        65,0,0,751,752,5,140,0,0,752,754,3,56,28,0,753,743,1,0,0,0,753,748,
        1,0,0,0,754,53,1,0,0,0,755,757,5,65,0,0,756,758,5,140,0,0,757,756,
        1,0,0,0,757,758,1,0,0,0,758,759,1,0,0,0,759,760,3,98,49,0,760,55,
        1,0,0,0,761,763,5,66,0,0,762,764,5,140,0,0,763,762,1,0,0,0,763,764,
        1,0,0,0,764,765,1,0,0,0,765,776,3,58,29,0,766,768,5,140,0,0,767,
        766,1,0,0,0,767,768,1,0,0,0,768,769,1,0,0,0,769,771,5,5,0,0,770,
        772,5,140,0,0,771,770,1,0,0,0,771,772,1,0,0,0,772,773,1,0,0,0,773,
        775,3,58,29,0,774,767,1,0,0,0,775,778,1,0,0,0,776,774,1,0,0,0,776,
        777,1,0,0,0,777,57,1,0,0,0,778,776,1,0,0,0,779,781,3,132,66,0,780,
        782,5,140,0,0,781,780,1,0,0,0,781,782,1,0,0,0,782,783,1,0,0,0,783,
        785,5,2,0,0,784,786,5,140,0,0,785,784,1,0,0,0,785,786,1,0,0,0,786,
        787,1,0,0,0,787,788,3,134,67,0,788,816,1,0,0,0,789,791,3,208,104,
        0,790,792,5,140,0,0,791,790,1,0,0,0,791,792,1,0,0,0,792,793,1,0,
        0,0,793,795,5,2,0,0,794,796,5,140,0,0,795,794,1,0,0,0,795,796,1,
        0,0,0,796,797,1,0,0,0,797,798,3,134,67,0,798,816,1,0,0,0,799,801,
        3,208,104,0,800,802,5,140,0,0,801,800,1,0,0,0,801,802,1,0,0,0,802,
        803,1,0,0,0,803,805,5,10,0,0,804,806,5,140,0,0,805,804,1,0,0,0,805,
        806,1,0,0,0,806,807,1,0,0,0,807,808,3,134,67,0,808,816,1,0,0,0,809,
        811,3,208,104,0,810,812,5,140,0,0,811,810,1,0,0,0,811,812,1,0,0,
        0,812,813,1,0,0,0,813,814,3,122,61,0,814,816,1,0,0,0,815,779,1,0,
        0,0,815,789,1,0,0,0,815,799,1,0,0,0,815,809,1,0,0,0,816,59,1,0,0,
        0,817,818,5,67,0,0,818,820,5,140,0,0,819,817,1,0,0,0,819,820,1,0,
        0,0,820,821,1,0,0,0,821,823,5,68,0,0,822,824,5,140,0,0,823,822,1,
        0,0,0,823,824,1,0,0,0,824,825,1,0,0,0,825,836,3,134,67,0,826,828,
        5,140,0,0,827,826,1,0,0,0,827,828,1,0,0,0,828,829,1,0,0,0,829,831,
        5,5,0,0,830,832,5,140,0,0,831,830,1,0,0,0,831,832,1,0,0,0,832,833,
        1,0,0,0,833,835,3,134,67,0,834,827,1,0,0,0,835,838,1,0,0,0,836,834,
        1,0,0,0,836,837,1,0,0,0,837,61,1,0,0,0,838,836,1,0,0,0,839,840,5,
        69,0,0,840,841,5,140,0,0,841,852,3,64,32,0,842,844,5,140,0,0,843,
        842,1,0,0,0,843,844,1,0,0,0,844,845,1,0,0,0,845,847,5,5,0,0,846,
        848,5,140,0,0,847,846,1,0,0,0,847,848,1,0,0,0,848,849,1,0,0,0,849,
        851,3,64,32,0,850,843,1,0,0,0,851,854,1,0,0,0,852,850,1,0,0,0,852,
        853,1,0,0,0,853,63,1,0,0,0,854,852,1,0,0,0,855,856,3,208,104,0,856,
        857,3,122,61,0,857,860,1,0,0,0,858,860,3,132,66,0,859,855,1,0,0,
        0,859,858,1,0,0,0,860,65,1,0,0,0,861,862,5,70,0,0,862,863,5,140,
        0,0,863,870,3,198,99,0,864,866,5,140,0,0,865,864,1,0,0,0,865,866,
        1,0,0,0,866,867,1,0,0,0,867,868,5,71,0,0,868,869,5,140,0,0,869,871,
        3,70,35,0,870,865,1,0,0,0,870,871,1,0,0,0,871,67,1,0,0,0,872,873,
        5,70,0,0,873,876,5,140,0,0,874,877,3,198,99,0,875,877,3,200,100,
        0,876,874,1,0,0,0,876,875,1,0,0,0,877,887,1,0,0,0,878,880,5,140,
        0,0,879,878,1,0,0,0,879,880,1,0,0,0,880,881,1,0,0,0,881,882,5,71,
        0,0,882,885,5,140,0,0,883,886,5,11,0,0,884,886,3,70,35,0,885,883,
        1,0,0,0,885,884,1,0,0,0,886,888,1,0,0,0,887,879,1,0,0,0,887,888,
        1,0,0,0,888,69,1,0,0,0,889,900,3,72,36,0,890,892,5,140,0,0,891,890,
        1,0,0,0,891,892,1,0,0,0,892,893,1,0,0,0,893,895,5,5,0,0,894,896,
        5,140,0,0,895,894,1,0,0,0,895,896,1,0,0,0,896,897,1,0,0,0,897,899,
        3,72,36,0,898,891,1,0,0,0,899,902,1,0,0,0,900,898,1,0,0,0,900,901,
        1,0,0,0,901,907,1,0,0,0,902,900,1,0,0,0,903,905,5,140,0,0,904,903,
        1,0,0,0,904,905,1,0,0,0,905,906,1,0,0,0,906,908,3,96,48,0,907,904,
        1,0,0,0,907,908,1,0,0,0,908,71,1,0,0,0,909,910,3,202,101,0,910,911,
        5,140,0,0,911,912,5,62,0,0,912,913,5,140,0,0,913,915,1,0,0,0,914,
        909,1,0,0,0,914,915,1,0,0,0,915,916,1,0,0,0,916,917,3,208,104,0,
        917,73,1,0,0,0,918,919,5,72,0,0,919,924,3,78,39,0,920,922,5,140,
        0,0,921,920,1,0,0,0,921,922,1,0,0,0,922,923,1,0,0,0,923,925,3,96,
        48,0,924,921,1,0,0,0,924,925,1,0,0,0,925,75,1,0,0,0,926,927,5,73,
        0,0,927,928,3,78,39,0,928,77,1,0,0,0,929,931,5,140,0,0,930,929,1,
        0,0,0,930,931,1,0,0,0,931,932,1,0,0,0,932,934,5,74,0,0,933,930,1,
        0,0,0,933,934,1,0,0,0,934,935,1,0,0,0,935,936,5,140,0,0,936,939,
        3,80,40,0,937,938,5,140,0,0,938,940,3,88,44,0,939,937,1,0,0,0,939,
        940,1,0,0,0,940,943,1,0,0,0,941,942,5,140,0,0,942,944,3,90,45,0,
        943,941,1,0,0,0,943,944,1,0,0,0,944,947,1,0,0,0,945,946,5,140,0,
        0,946,948,3,92,46,0,947,945,1,0,0,0,947,948,1,0,0,0,948,79,1,0,0,
        0,949,960,5,11,0,0,950,952,5,140,0,0,951,950,1,0,0,0,951,952,1,0,
        0,0,952,953,1,0,0,0,953,955,5,5,0,0,954,956,5,140,0,0,955,954,1,
        0,0,0,955,956,1,0,0,0,956,957,1,0,0,0,957,959,3,82,41,0,958,951,
        1,0,0,0,959,962,1,0,0,0,960,958,1,0,0,0,960,961,1,0,0,0,961,978,
        1,0,0,0,962,960,1,0,0,0,963,974,3,82,41,0,964,966,5,140,0,0,965,
        964,1,0,0,0,965,966,1,0,0,0,966,967,1,0,0,0,967,969,5,5,0,0,968,
        970,5,140,0,0,969,968,1,0,0,0,969,970,1,0,0,0,970,971,1,0,0,0,971,
        973,3,82,41,0,972,965,1,0,0,0,973,976,1,0,0,0,974,972,1,0,0,0,974,
        975,1,0,0,0,975,978,1,0,0,0,976,974,1,0,0,0,977,949,1,0,0,0,977,
        963,1,0,0,0,978,81,1,0,0,0,979,980,3,134,67,0,980,981,5,140,0,0,
        981,982,5,62,0,0,982,983,5,140,0,0,983,984,3,208,104,0,984,987,1,
        0,0,0,985,987,3,134,67,0,986,979,1,0,0,0,986,985,1,0,0,0,987,83,
        1,0,0,0,988,990,5,8,0,0,989,991,5,140,0,0,990,989,1,0,0,0,990,991,
        1,0,0,0,991,1006,1,0,0,0,992,1003,3,86,43,0,993,995,5,140,0,0,994,
        993,1,0,0,0,994,995,1,0,0,0,995,996,1,0,0,0,996,998,5,5,0,0,997,
        999,5,140,0,0,998,997,1,0,0,0,998,999,1,0,0,0,999,1000,1,0,0,0,1000,
        1002,3,86,43,0,1001,994,1,0,0,0,1002,1005,1,0,0,0,1003,1001,1,0,
        0,0,1003,1004,1,0,0,0,1004,1007,1,0,0,0,1005,1003,1,0,0,0,1006,992,
        1,0,0,0,1006,1007,1,0,0,0,1007,1009,1,0,0,0,1008,1010,5,140,0,0,
        1009,1008,1,0,0,0,1009,1010,1,0,0,0,1010,1011,1,0,0,0,1011,1012,
        5,9,0,0,1012,85,1,0,0,0,1013,1015,5,12,0,0,1014,1016,5,140,0,0,1015,
        1014,1,0,0,0,1015,1016,1,0,0,0,1016,1017,1,0,0,0,1017,1035,5,11,
        0,0,1018,1020,5,12,0,0,1019,1021,5,140,0,0,1020,1019,1,0,0,0,1020,
        1021,1,0,0,0,1021,1022,1,0,0,0,1022,1035,3,224,112,0,1023,1025,3,
        224,112,0,1024,1026,5,140,0,0,1025,1024,1,0,0,0,1025,1026,1,0,0,
        0,1026,1027,1,0,0,0,1027,1029,5,3,0,0,1028,1030,5,140,0,0,1029,1028,
        1,0,0,0,1029,1030,1,0,0,0,1030,1031,1,0,0,0,1031,1032,3,134,67,0,
        1032,1035,1,0,0,0,1033,1035,3,208,104,0,1034,1013,1,0,0,0,1034,1018,
        1,0,0,0,1034,1023,1,0,0,0,1034,1033,1,0,0,0,1035,87,1,0,0,0,1036,
        1037,5,75,0,0,1037,1038,5,140,0,0,1038,1039,5,76,0,0,1039,1040,5,
        140,0,0,1040,1048,3,94,47,0,1041,1043,5,5,0,0,1042,1044,5,140,0,
        0,1043,1042,1,0,0,0,1043,1044,1,0,0,0,1044,1045,1,0,0,0,1045,1047,
        3,94,47,0,1046,1041,1,0,0,0,1047,1050,1,0,0,0,1048,1046,1,0,0,0,
        1048,1049,1,0,0,0,1049,89,1,0,0,0,1050,1048,1,0,0,0,1051,1052,5,
        77,0,0,1052,1053,5,140,0,0,1053,1054,3,134,67,0,1054,91,1,0,0,0,
        1055,1056,5,78,0,0,1056,1057,5,140,0,0,1057,1058,3,134,67,0,1058,
        93,1,0,0,0,1059,1064,3,134,67,0,1060,1062,5,140,0,0,1061,1060,1,
        0,0,0,1061,1062,1,0,0,0,1062,1063,1,0,0,0,1063,1065,7,1,0,0,1064,
        1061,1,0,0,0,1064,1065,1,0,0,0,1065,95,1,0,0,0,1066,1067,5,83,0,
        0,1067,1068,5,140,0,0,1068,1069,3,134,67,0,1069,97,1,0,0,0,1070,
        1081,3,100,50,0,1071,1073,5,140,0,0,1072,1071,1,0,0,0,1072,1073,
        1,0,0,0,1073,1074,1,0,0,0,1074,1076,5,5,0,0,1075,1077,5,140,0,0,
        1076,1075,1,0,0,0,1076,1077,1,0,0,0,1077,1078,1,0,0,0,1078,1080,
        3,100,50,0,1079,1072,1,0,0,0,1080,1083,1,0,0,0,1081,1079,1,0,0,0,
        1081,1082,1,0,0,0,1082,99,1,0,0,0,1083,1081,1,0,0,0,1084,1086,3,
        208,104,0,1085,1087,5,140,0,0,1086,1085,1,0,0,0,1086,1087,1,0,0,
        0,1087,1088,1,0,0,0,1088,1090,5,2,0,0,1089,1091,5,140,0,0,1090,1089,
        1,0,0,0,1090,1091,1,0,0,0,1091,1092,1,0,0,0,1092,1093,3,102,51,0,
        1093,1096,1,0,0,0,1094,1096,3,102,51,0,1095,1084,1,0,0,0,1095,1094,
        1,0,0,0,1096,101,1,0,0,0,1097,1100,3,104,52,0,1098,1100,3,106,53,
        0,1099,1097,1,0,0,0,1099,1098,1,0,0,0,1100,103,1,0,0,0,1101,1103,
        7,2,0,0,1102,1104,5,140,0,0,1103,1102,1,0,0,0,1103,1104,1,0,0,0,
        1104,1105,1,0,0,0,1105,1107,5,4,0,0,1106,1108,5,140,0,0,1107,1106,
        1,0,0,0,1107,1108,1,0,0,0,1108,1109,1,0,0,0,1109,1111,3,106,53,0,
        1110,1112,5,140,0,0,1111,1110,1,0,0,0,1111,1112,1,0,0,0,1112,1113,
        1,0,0,0,1113,1114,5,6,0,0,1114,105,1,0,0,0,1115,1122,3,110,55,0,
        1116,1118,5,140,0,0,1117,1116,1,0,0,0,1117,1118,1,0,0,0,1118,1119,
        1,0,0,0,1119,1121,3,112,56,0,1120,1117,1,0,0,0,1121,1124,1,0,0,0,
        1122,1120,1,0,0,0,1122,1123,1,0,0,0,1123,1130,1,0,0,0,1124,1122,
        1,0,0,0,1125,1126,5,4,0,0,1126,1127,3,106,53,0,1127,1128,5,6,0,0,
        1128,1130,1,0,0,0,1129,1115,1,0,0,0,1129,1125,1,0,0,0,1130,107,1,
        0,0,0,1131,1136,3,110,55,0,1132,1134,5,140,0,0,1133,1132,1,0,0,0,
        1133,1134,1,0,0,0,1134,1135,1,0,0,0,1135,1137,3,112,56,0,1136,1133,
        1,0,0,0,1137,1138,1,0,0,0,1138,1136,1,0,0,0,1138,1139,1,0,0,0,1139,
        109,1,0,0,0,1140,1142,5,4,0,0,1141,1143,5,140,0,0,1142,1141,1,0,
        0,0,1142,1143,1,0,0,0,1143,1148,1,0,0,0,1144,1146,3,208,104,0,1145,
        1147,5,140,0,0,1146,1145,1,0,0,0,1146,1147,1,0,0,0,1147,1149,1,0,
        0,0,1148,1144,1,0,0,0,1148,1149,1,0,0,0,1149,1154,1,0,0,0,1150,1152,
        3,122,61,0,1151,1153,5,140,0,0,1152,1151,1,0,0,0,1152,1153,1,0,0,
        0,1153,1155,1,0,0,0,1154,1150,1,0,0,0,1154,1155,1,0,0,0,1155,1160,
        1,0,0,0,1156,1158,3,118,59,0,1157,1159,5,140,0,0,1158,1157,1,0,0,
        0,1158,1159,1,0,0,0,1159,1161,1,0,0,0,1160,1156,1,0,0,0,1160,1161,
        1,0,0,0,1161,1162,1,0,0,0,1162,1163,5,6,0,0,1163,111,1,0,0,0,1164,
        1166,3,114,57,0,1165,1167,5,140,0,0,1166,1165,1,0,0,0,1166,1167,
        1,0,0,0,1167,1168,1,0,0,0,1168,1169,3,110,55,0,1169,113,1,0,0,0,
        1170,1172,3,234,117,0,1171,1173,5,140,0,0,1172,1171,1,0,0,0,1172,
        1173,1,0,0,0,1173,1174,1,0,0,0,1174,1176,3,238,119,0,1175,1177,5,
        140,0,0,1176,1175,1,0,0,0,1176,1177,1,0,0,0,1177,1179,1,0,0,0,1178,
        1180,3,116,58,0,1179,1178,1,0,0,0,1179,1180,1,0,0,0,1180,1182,1,
        0,0,0,1181,1183,5,140,0,0,1182,1181,1,0,0,0,1182,1183,1,0,0,0,1183,
        1184,1,0,0,0,1184,1186,3,238,119,0,1185,1187,5,140,0,0,1186,1185,
        1,0,0,0,1186,1187,1,0,0,0,1187,1188,1,0,0,0,1188,1189,3,236,118,
        0,1189,1235,1,0,0,0,1190,1192,3,234,117,0,1191,1193,5,140,0,0,1192,
        1191,1,0,0,0,1192,1193,1,0,0,0,1193,1194,1,0,0,0,1194,1196,3,238,
        119,0,1195,1197,5,140,0,0,1196,1195,1,0,0,0,1196,1197,1,0,0,0,1197,
        1199,1,0,0,0,1198,1200,3,116,58,0,1199,1198,1,0,0,0,1199,1200,1,
        0,0,0,1200,1202,1,0,0,0,1201,1203,5,140,0,0,1202,1201,1,0,0,0,1202,
        1203,1,0,0,0,1203,1204,1,0,0,0,1204,1205,3,238,119,0,1205,1235,1,
        0,0,0,1206,1208,3,238,119,0,1207,1209,5,140,0,0,1208,1207,1,0,0,
        0,1208,1209,1,0,0,0,1209,1211,1,0,0,0,1210,1212,3,116,58,0,1211,
        1210,1,0,0,0,1211,1212,1,0,0,0,1212,1214,1,0,0,0,1213,1215,5,140,
        0,0,1214,1213,1,0,0,0,1214,1215,1,0,0,0,1215,1216,1,0,0,0,1216,1218,
        3,238,119,0,1217,1219,5,140,0,0,1218,1217,1,0,0,0,1218,1219,1,0,
        0,0,1219,1220,1,0,0,0,1220,1221,3,236,118,0,1221,1235,1,0,0,0,1222,
        1224,3,238,119,0,1223,1225,5,140,0,0,1224,1223,1,0,0,0,1224,1225,
        1,0,0,0,1225,1227,1,0,0,0,1226,1228,3,116,58,0,1227,1226,1,0,0,0,
        1227,1228,1,0,0,0,1228,1230,1,0,0,0,1229,1231,5,140,0,0,1230,1229,
        1,0,0,0,1230,1231,1,0,0,0,1231,1232,1,0,0,0,1232,1233,3,238,119,
        0,1233,1235,1,0,0,0,1234,1170,1,0,0,0,1234,1190,1,0,0,0,1234,1206,
        1,0,0,0,1234,1222,1,0,0,0,1235,115,1,0,0,0,1236,1238,5,13,0,0,1237,
        1239,5,140,0,0,1238,1237,1,0,0,0,1238,1239,1,0,0,0,1239,1244,1,0,
        0,0,1240,1242,3,208,104,0,1241,1243,5,140,0,0,1242,1241,1,0,0,0,
        1242,1243,1,0,0,0,1243,1245,1,0,0,0,1244,1240,1,0,0,0,1244,1245,
        1,0,0,0,1245,1250,1,0,0,0,1246,1248,3,120,60,0,1247,1249,5,140,0,
        0,1248,1247,1,0,0,0,1248,1249,1,0,0,0,1249,1251,1,0,0,0,1250,1246,
        1,0,0,0,1250,1251,1,0,0,0,1251,1253,1,0,0,0,1252,1254,3,126,63,0,
        1253,1252,1,0,0,0,1253,1254,1,0,0,0,1254,1259,1,0,0,0,1255,1257,
        3,118,59,0,1256,1258,5,140,0,0,1257,1256,1,0,0,0,1257,1258,1,0,0,
        0,1258,1260,1,0,0,0,1259,1255,1,0,0,0,1259,1260,1,0,0,0,1260,1261,
        1,0,0,0,1261,1262,5,14,0,0,1262,117,1,0,0,0,1263,1266,3,222,111,
        0,1264,1266,3,226,113,0,1265,1263,1,0,0,0,1265,1264,1,0,0,0,1266,
        119,1,0,0,0,1267,1269,5,3,0,0,1268,1270,5,140,0,0,1269,1268,1,0,
        0,0,1269,1270,1,0,0,0,1270,1271,1,0,0,0,1271,1285,3,130,65,0,1272,
        1274,5,140,0,0,1273,1272,1,0,0,0,1273,1274,1,0,0,0,1274,1275,1,0,
        0,0,1275,1277,5,7,0,0,1276,1278,5,3,0,0,1277,1276,1,0,0,0,1277,1278,
        1,0,0,0,1278,1280,1,0,0,0,1279,1281,5,140,0,0,1280,1279,1,0,0,0,
        1280,1281,1,0,0,0,1281,1282,1,0,0,0,1282,1284,3,130,65,0,1283,1273,
        1,0,0,0,1284,1287,1,0,0,0,1285,1283,1,0,0,0,1285,1286,1,0,0,0,1286,
        121,1,0,0,0,1287,1285,1,0,0,0,1288,1295,3,124,62,0,1289,1291,5,140,
        0,0,1290,1289,1,0,0,0,1290,1291,1,0,0,0,1291,1292,1,0,0,0,1292,1294,
        3,124,62,0,1293,1290,1,0,0,0,1294,1297,1,0,0,0,1295,1293,1,0,0,0,
        1295,1296,1,0,0,0,1296,123,1,0,0,0,1297,1295,1,0,0,0,1298,1300,5,
        3,0,0,1299,1301,5,140,0,0,1300,1299,1,0,0,0,1300,1301,1,0,0,0,1301,
        1302,1,0,0,0,1302,1303,3,128,64,0,1303,125,1,0,0,0,1304,1306,5,11,
        0,0,1305,1307,5,140,0,0,1306,1305,1,0,0,0,1306,1307,1,0,0,0,1307,
        1312,1,0,0,0,1308,1310,3,216,108,0,1309,1311,5,140,0,0,1310,1309,
        1,0,0,0,1310,1311,1,0,0,0,1311,1313,1,0,0,0,1312,1308,1,0,0,0,1312,
        1313,1,0,0,0,1313,1324,1,0,0,0,1314,1316,5,15,0,0,1315,1317,5,140,
        0,0,1316,1315,1,0,0,0,1316,1317,1,0,0,0,1317,1322,1,0,0,0,1318,1320,
        3,216,108,0,1319,1321,5,140,0,0,1320,1319,1,0,0,0,1320,1321,1,0,
        0,0,1321,1323,1,0,0,0,1322,1318,1,0,0,0,1322,1323,1,0,0,0,1323,1325,
        1,0,0,0,1324,1314,1,0,0,0,1324,1325,1,0,0,0,1325,127,1,0,0,0,1326,
        1327,3,228,114,0,1327,129,1,0,0,0,1328,1329,3,228,114,0,1329,131,
        1,0,0,0,1330,1335,3,170,85,0,1331,1333,5,140,0,0,1332,1331,1,0,0,
        0,1332,1333,1,0,0,0,1333,1334,1,0,0,0,1334,1336,3,168,84,0,1335,
        1332,1,0,0,0,1336,1337,1,0,0,0,1337,1335,1,0,0,0,1337,1338,1,0,0,
        0,1338,133,1,0,0,0,1339,1340,3,136,68,0,1340,135,1,0,0,0,1341,1348,
        3,138,69,0,1342,1343,5,140,0,0,1343,1344,5,86,0,0,1344,1345,5,140,
        0,0,1345,1347,3,138,69,0,1346,1342,1,0,0,0,1347,1350,1,0,0,0,1348,
        1346,1,0,0,0,1348,1349,1,0,0,0,1349,137,1,0,0,0,1350,1348,1,0,0,
        0,1351,1358,3,140,70,0,1352,1353,5,140,0,0,1353,1354,5,87,0,0,1354,
        1355,5,140,0,0,1355,1357,3,140,70,0,1356,1352,1,0,0,0,1357,1360,
        1,0,0,0,1358,1356,1,0,0,0,1358,1359,1,0,0,0,1359,139,1,0,0,0,1360,
        1358,1,0,0,0,1361,1368,3,142,71,0,1362,1363,5,140,0,0,1363,1364,
        5,88,0,0,1364,1365,5,140,0,0,1365,1367,3,142,71,0,1366,1362,1,0,
        0,0,1367,1370,1,0,0,0,1368,1366,1,0,0,0,1368,1369,1,0,0,0,1369,141,
        1,0,0,0,1370,1368,1,0,0,0,1371,1373,5,89,0,0,1372,1374,5,140,0,0,
        1373,1372,1,0,0,0,1373,1374,1,0,0,0,1374,1376,1,0,0,0,1375,1371,
        1,0,0,0,1376,1379,1,0,0,0,1377,1375,1,0,0,0,1377,1378,1,0,0,0,1378,
        1380,1,0,0,0,1379,1377,1,0,0,0,1380,1381,3,144,72,0,1381,143,1,0,
        0,0,1382,1389,3,148,74,0,1383,1385,5,140,0,0,1384,1383,1,0,0,0,1384,
        1385,1,0,0,0,1385,1386,1,0,0,0,1386,1388,3,146,73,0,1387,1384,1,
        0,0,0,1388,1391,1,0,0,0,1389,1387,1,0,0,0,1389,1390,1,0,0,0,1390,
        145,1,0,0,0,1391,1389,1,0,0,0,1392,1394,5,2,0,0,1393,1395,5,140,
        0,0,1394,1393,1,0,0,0,1394,1395,1,0,0,0,1395,1396,1,0,0,0,1396,1423,
        3,148,74,0,1397,1399,5,16,0,0,1398,1400,5,140,0,0,1399,1398,1,0,
        0,0,1399,1400,1,0,0,0,1400,1401,1,0,0,0,1401,1423,3,148,74,0,1402,
        1404,5,17,0,0,1403,1405,5,140,0,0,1404,1403,1,0,0,0,1404,1405,1,
        0,0,0,1405,1406,1,0,0,0,1406,1423,3,148,74,0,1407,1409,5,18,0,0,
        1408,1410,5,140,0,0,1409,1408,1,0,0,0,1409,1410,1,0,0,0,1410,1411,
        1,0,0,0,1411,1423,3,148,74,0,1412,1414,5,19,0,0,1413,1415,5,140,
        0,0,1414,1413,1,0,0,0,1414,1415,1,0,0,0,1415,1416,1,0,0,0,1416,1423,
        3,148,74,0,1417,1419,5,20,0,0,1418,1420,5,140,0,0,1419,1418,1,0,
        0,0,1419,1420,1,0,0,0,1420,1421,1,0,0,0,1421,1423,3,148,74,0,1422,
        1392,1,0,0,0,1422,1397,1,0,0,0,1422,1402,1,0,0,0,1422,1407,1,0,0,
        0,1422,1412,1,0,0,0,1422,1417,1,0,0,0,1423,147,1,0,0,0,1424,1430,
        3,156,78,0,1425,1429,3,150,75,0,1426,1429,3,152,76,0,1427,1429,3,
        154,77,0,1428,1425,1,0,0,0,1428,1426,1,0,0,0,1428,1427,1,0,0,0,1429,
        1432,1,0,0,0,1430,1428,1,0,0,0,1430,1431,1,0,0,0,1431,149,1,0,0,
        0,1432,1430,1,0,0,0,1433,1434,5,140,0,0,1434,1435,5,90,0,0,1435,
        1436,5,140,0,0,1436,1444,5,72,0,0,1437,1438,5,140,0,0,1438,1439,
        5,91,0,0,1439,1440,5,140,0,0,1440,1444,5,72,0,0,1441,1442,5,140,
        0,0,1442,1444,5,92,0,0,1443,1433,1,0,0,0,1443,1437,1,0,0,0,1443,
        1441,1,0,0,0,1444,1446,1,0,0,0,1445,1447,5,140,0,0,1446,1445,1,0,
        0,0,1446,1447,1,0,0,0,1447,1448,1,0,0,0,1448,1449,3,156,78,0,1449,
        151,1,0,0,0,1450,1451,5,140,0,0,1451,1453,5,93,0,0,1452,1454,5,140,
        0,0,1453,1452,1,0,0,0,1453,1454,1,0,0,0,1454,1455,1,0,0,0,1455,1456,
        3,156,78,0,1456,153,1,0,0,0,1457,1458,5,140,0,0,1458,1459,5,94,0,
        0,1459,1460,5,140,0,0,1460,1468,5,95,0,0,1461,1462,5,140,0,0,1462,
        1463,5,94,0,0,1463,1464,5,140,0,0,1464,1465,5,89,0,0,1465,1466,5,
        140,0,0,1466,1468,5,95,0,0,1467,1457,1,0,0,0,1467,1461,1,0,0,0,1468,
        155,1,0,0,0,1469,1488,3,158,79,0,1470,1472,5,140,0,0,1471,1470,1,
        0,0,0,1471,1472,1,0,0,0,1472,1473,1,0,0,0,1473,1475,5,21,0,0,1474,
        1476,5,140,0,0,1475,1474,1,0,0,0,1475,1476,1,0,0,0,1476,1477,1,0,
        0,0,1477,1487,3,158,79,0,1478,1480,5,140,0,0,1479,1478,1,0,0,0,1479,
        1480,1,0,0,0,1480,1481,1,0,0,0,1481,1483,5,22,0,0,1482,1484,5,140,
        0,0,1483,1482,1,0,0,0,1483,1484,1,0,0,0,1484,1485,1,0,0,0,1485,1487,
        3,158,79,0,1486,1471,1,0,0,0,1486,1479,1,0,0,0,1487,1490,1,0,0,0,
        1488,1486,1,0,0,0,1488,1489,1,0,0,0,1489,157,1,0,0,0,1490,1488,1,
        0,0,0,1491,1518,3,160,80,0,1492,1494,5,140,0,0,1493,1492,1,0,0,0,
        1493,1494,1,0,0,0,1494,1495,1,0,0,0,1495,1497,5,11,0,0,1496,1498,
        5,140,0,0,1497,1496,1,0,0,0,1497,1498,1,0,0,0,1498,1499,1,0,0,0,
        1499,1517,3,160,80,0,1500,1502,5,140,0,0,1501,1500,1,0,0,0,1501,
        1502,1,0,0,0,1502,1503,1,0,0,0,1503,1505,5,23,0,0,1504,1506,5,140,
        0,0,1505,1504,1,0,0,0,1505,1506,1,0,0,0,1506,1507,1,0,0,0,1507,1517,
        3,160,80,0,1508,1510,5,140,0,0,1509,1508,1,0,0,0,1509,1510,1,0,0,
        0,1510,1511,1,0,0,0,1511,1513,5,24,0,0,1512,1514,5,140,0,0,1513,
        1512,1,0,0,0,1513,1514,1,0,0,0,1514,1515,1,0,0,0,1515,1517,3,160,
        80,0,1516,1493,1,0,0,0,1516,1501,1,0,0,0,1516,1509,1,0,0,0,1517,
        1520,1,0,0,0,1518,1516,1,0,0,0,1518,1519,1,0,0,0,1519,159,1,0,0,
        0,1520,1518,1,0,0,0,1521,1532,3,162,81,0,1522,1524,5,140,0,0,1523,
        1522,1,0,0,0,1523,1524,1,0,0,0,1524,1525,1,0,0,0,1525,1527,5,25,
        0,0,1526,1528,5,140,0,0,1527,1526,1,0,0,0,1527,1528,1,0,0,0,1528,
        1529,1,0,0,0,1529,1531,3,162,81,0,1530,1523,1,0,0,0,1531,1534,1,
        0,0,0,1532,1530,1,0,0,0,1532,1533,1,0,0,0,1533,161,1,0,0,0,1534,
        1532,1,0,0,0,1535,1542,3,164,82,0,1536,1538,7,3,0,0,1537,1539,5,
        140,0,0,1538,1537,1,0,0,0,1538,1539,1,0,0,0,1539,1540,1,0,0,0,1540,
        1542,3,164,82,0,1541,1535,1,0,0,0,1541,1536,1,0,0,0,1542,163,1,0,
        0,0,1543,1554,3,170,85,0,1544,1546,5,140,0,0,1545,1544,1,0,0,0,1545,
        1546,1,0,0,0,1546,1547,1,0,0,0,1547,1553,3,166,83,0,1548,1550,5,
        140,0,0,1549,1548,1,0,0,0,1549,1550,1,0,0,0,1550,1551,1,0,0,0,1551,
        1553,3,168,84,0,1552,1545,1,0,0,0,1552,1549,1,0,0,0,1553,1556,1,
        0,0,0,1554,1552,1,0,0,0,1554,1555,1,0,0,0,1555,1561,1,0,0,0,1556,
        1554,1,0,0,0,1557,1559,5,140,0,0,1558,1557,1,0,0,0,1558,1559,1,0,
        0,0,1559,1560,1,0,0,0,1560,1562,3,122,61,0,1561,1558,1,0,0,0,1561,
        1562,1,0,0,0,1562,165,1,0,0,0,1563,1564,5,13,0,0,1564,1565,3,134,
        67,0,1565,1566,5,14,0,0,1566,1577,1,0,0,0,1567,1569,5,13,0,0,1568,
        1570,3,134,67,0,1569,1568,1,0,0,0,1569,1570,1,0,0,0,1570,1571,1,
        0,0,0,1571,1573,5,15,0,0,1572,1574,3,134,67,0,1573,1572,1,0,0,0,
        1573,1574,1,0,0,0,1574,1575,1,0,0,0,1575,1577,5,14,0,0,1576,1563,
        1,0,0,0,1576,1567,1,0,0,0,1577,167,1,0,0,0,1578,1580,5,12,0,0,1579,
        1581,5,140,0,0,1580,1579,1,0,0,0,1580,1581,1,0,0,0,1581,1582,1,0,
        0,0,1582,1583,3,224,112,0,1583,169,1,0,0,0,1584,1617,3,210,105,0,
        1585,1617,3,226,113,0,1586,1617,3,172,86,0,1587,1589,5,96,0,0,1588,
        1590,5,140,0,0,1589,1588,1,0,0,0,1589,1590,1,0,0,0,1590,1591,1,0,
        0,0,1591,1593,5,4,0,0,1592,1594,5,140,0,0,1593,1592,1,0,0,0,1593,
        1594,1,0,0,0,1594,1595,1,0,0,0,1595,1597,5,11,0,0,1596,1598,5,140,
        0,0,1597,1596,1,0,0,0,1597,1598,1,0,0,0,1598,1599,1,0,0,0,1599,1617,
        5,6,0,0,1600,1617,3,176,88,0,1601,1617,3,178,89,0,1602,1617,3,190,
        95,0,1603,1617,3,104,52,0,1604,1617,3,180,90,0,1605,1617,3,184,92,
        0,1606,1617,3,186,93,0,1607,1617,3,192,96,0,1608,1617,3,196,98,0,
        1609,1614,3,208,104,0,1610,1612,5,140,0,0,1611,1610,1,0,0,0,1611,
        1612,1,0,0,0,1612,1613,1,0,0,0,1613,1615,3,84,42,0,1614,1611,1,0,
        0,0,1614,1615,1,0,0,0,1615,1617,1,0,0,0,1616,1584,1,0,0,0,1616,1585,
        1,0,0,0,1616,1586,1,0,0,0,1616,1587,1,0,0,0,1616,1600,1,0,0,0,1616,
        1601,1,0,0,0,1616,1602,1,0,0,0,1616,1603,1,0,0,0,1616,1604,1,0,0,
        0,1616,1605,1,0,0,0,1616,1606,1,0,0,0,1616,1607,1,0,0,0,1616,1608,
        1,0,0,0,1616,1609,1,0,0,0,1617,171,1,0,0,0,1618,1623,5,97,0,0,1619,
        1621,5,140,0,0,1620,1619,1,0,0,0,1620,1621,1,0,0,0,1621,1622,1,0,
        0,0,1622,1624,3,174,87,0,1623,1620,1,0,0,0,1624,1625,1,0,0,0,1625,
        1623,1,0,0,0,1625,1626,1,0,0,0,1626,1641,1,0,0,0,1627,1629,5,97,
        0,0,1628,1630,5,140,0,0,1629,1628,1,0,0,0,1629,1630,1,0,0,0,1630,
        1631,1,0,0,0,1631,1636,3,134,67,0,1632,1634,5,140,0,0,1633,1632,
        1,0,0,0,1633,1634,1,0,0,0,1634,1635,1,0,0,0,1635,1637,3,174,87,0,
        1636,1633,1,0,0,0,1637,1638,1,0,0,0,1638,1636,1,0,0,0,1638,1639,
        1,0,0,0,1639,1641,1,0,0,0,1640,1618,1,0,0,0,1640,1627,1,0,0,0,1641,
        1650,1,0,0,0,1642,1644,5,140,0,0,1643,1642,1,0,0,0,1643,1644,1,0,
        0,0,1644,1645,1,0,0,0,1645,1647,5,98,0,0,1646,1648,5,140,0,0,1647,
        1646,1,0,0,0,1647,1648,1,0,0,0,1648,1649,1,0,0,0,1649,1651,3,134,
        67,0,1650,1643,1,0,0,0,1650,1651,1,0,0,0,1651,1653,1,0,0,0,1652,
        1654,5,140,0,0,1653,1652,1,0,0,0,1653,1654,1,0,0,0,1654,1655,1,0,
        0,0,1655,1656,5,99,0,0,1656,173,1,0,0,0,1657,1659,5,100,0,0,1658,
        1660,5,140,0,0,1659,1658,1,0,0,0,1659,1660,1,0,0,0,1660,1661,1,0,
        0,0,1661,1663,3,134,67,0,1662,1664,5,140,0,0,1663,1662,1,0,0,0,1663,
        1664,1,0,0,0,1664,1665,1,0,0,0,1665,1667,5,101,0,0,1666,1668,5,140,
        0,0,1667,1666,1,0,0,0,1667,1668,1,0,0,0,1668,1669,1,0,0,0,1669,1670,
        3,134,67,0,1670,175,1,0,0,0,1671,1673,5,13,0,0,1672,1674,5,140,0,
        0,1673,1672,1,0,0,0,1673,1674,1,0,0,0,1674,1675,1,0,0,0,1675,1684,
        3,182,91,0,1676,1678,5,140,0,0,1677,1676,1,0,0,0,1677,1678,1,0,0,
        0,1678,1679,1,0,0,0,1679,1681,5,7,0,0,1680,1682,5,140,0,0,1681,1680,
        1,0,0,0,1681,1682,1,0,0,0,1682,1683,1,0,0,0,1683,1685,3,134,67,0,
        1684,1677,1,0,0,0,1684,1685,1,0,0,0,1685,1687,1,0,0,0,1686,1688,
        5,140,0,0,1687,1686,1,0,0,0,1687,1688,1,0,0,0,1688,1689,1,0,0,0,
        1689,1690,5,14,0,0,1690,177,1,0,0,0,1691,1693,5,13,0,0,1692,1694,
        5,140,0,0,1693,1692,1,0,0,0,1693,1694,1,0,0,0,1694,1703,1,0,0,0,
        1695,1697,3,208,104,0,1696,1698,5,140,0,0,1697,1696,1,0,0,0,1697,
        1698,1,0,0,0,1698,1699,1,0,0,0,1699,1701,5,2,0,0,1700,1702,5,140,
        0,0,1701,1700,1,0,0,0,1701,1702,1,0,0,0,1702,1704,1,0,0,0,1703,1695,
        1,0,0,0,1703,1704,1,0,0,0,1704,1705,1,0,0,0,1705,1707,3,108,54,0,
        1706,1708,5,140,0,0,1707,1706,1,0,0,0,1707,1708,1,0,0,0,1708,1713,
        1,0,0,0,1709,1711,3,96,48,0,1710,1712,5,140,0,0,1711,1710,1,0,0,
        0,1711,1712,1,0,0,0,1712,1714,1,0,0,0,1713,1709,1,0,0,0,1713,1714,
        1,0,0,0,1714,1715,1,0,0,0,1715,1717,5,7,0,0,1716,1718,5,140,0,0,
        1717,1716,1,0,0,0,1717,1718,1,0,0,0,1718,1719,1,0,0,0,1719,1721,
        3,134,67,0,1720,1722,5,140,0,0,1721,1720,1,0,0,0,1721,1722,1,0,0,
        0,1722,1723,1,0,0,0,1723,1724,5,14,0,0,1724,179,1,0,0,0,1725,1727,
        5,52,0,0,1726,1728,5,140,0,0,1727,1726,1,0,0,0,1727,1728,1,0,0,0,
        1728,1729,1,0,0,0,1729,1731,5,4,0,0,1730,1732,5,140,0,0,1731,1730,
        1,0,0,0,1731,1732,1,0,0,0,1732,1733,1,0,0,0,1733,1735,3,182,91,0,
        1734,1736,5,140,0,0,1735,1734,1,0,0,0,1735,1736,1,0,0,0,1736,1737,
        1,0,0,0,1737,1738,5,6,0,0,1738,1782,1,0,0,0,1739,1741,5,102,0,0,
        1740,1742,5,140,0,0,1741,1740,1,0,0,0,1741,1742,1,0,0,0,1742,1743,
        1,0,0,0,1743,1745,5,4,0,0,1744,1746,5,140,0,0,1745,1744,1,0,0,0,
        1745,1746,1,0,0,0,1746,1747,1,0,0,0,1747,1749,3,182,91,0,1748,1750,
        5,140,0,0,1749,1748,1,0,0,0,1749,1750,1,0,0,0,1750,1751,1,0,0,0,
        1751,1752,5,6,0,0,1752,1782,1,0,0,0,1753,1755,5,103,0,0,1754,1756,
        5,140,0,0,1755,1754,1,0,0,0,1755,1756,1,0,0,0,1756,1757,1,0,0,0,
        1757,1759,5,4,0,0,1758,1760,5,140,0,0,1759,1758,1,0,0,0,1759,1760,
        1,0,0,0,1760,1761,1,0,0,0,1761,1763,3,182,91,0,1762,1764,5,140,0,
        0,1763,1762,1,0,0,0,1763,1764,1,0,0,0,1764,1765,1,0,0,0,1765,1766,
        5,6,0,0,1766,1782,1,0,0,0,1767,1769,5,104,0,0,1768,1770,5,140,0,
        0,1769,1768,1,0,0,0,1769,1770,1,0,0,0,1770,1771,1,0,0,0,1771,1773,
        5,4,0,0,1772,1774,5,140,0,0,1773,1772,1,0,0,0,1773,1774,1,0,0,0,
        1774,1775,1,0,0,0,1775,1777,3,182,91,0,1776,1778,5,140,0,0,1777,
        1776,1,0,0,0,1777,1778,1,0,0,0,1778,1779,1,0,0,0,1779,1780,5,6,0,
        0,1780,1782,1,0,0,0,1781,1725,1,0,0,0,1781,1739,1,0,0,0,1781,1753,
        1,0,0,0,1781,1767,1,0,0,0,1782,181,1,0,0,0,1783,1788,3,188,94,0,
        1784,1786,5,140,0,0,1785,1784,1,0,0,0,1785,1786,1,0,0,0,1786,1787,
        1,0,0,0,1787,1789,3,96,48,0,1788,1785,1,0,0,0,1788,1789,1,0,0,0,
        1789,183,1,0,0,0,1790,1791,3,108,54,0,1791,185,1,0,0,0,1792,1794,
        5,4,0,0,1793,1795,5,140,0,0,1794,1793,1,0,0,0,1794,1795,1,0,0,0,
        1795,1796,1,0,0,0,1796,1798,3,134,67,0,1797,1799,5,140,0,0,1798,
        1797,1,0,0,0,1798,1799,1,0,0,0,1799,1800,1,0,0,0,1800,1801,5,6,0,
        0,1801,187,1,0,0,0,1802,1803,3,208,104,0,1803,1804,5,140,0,0,1804,
        1805,5,93,0,0,1805,1806,5,140,0,0,1806,1807,3,134,67,0,1807,189,
        1,0,0,0,1808,1810,5,105,0,0,1809,1811,5,140,0,0,1810,1809,1,0,0,
        0,1810,1811,1,0,0,0,1811,1812,1,0,0,0,1812,1814,5,4,0,0,1813,1815,
        5,140,0,0,1814,1813,1,0,0,0,1814,1815,1,0,0,0,1815,1816,1,0,0,0,
        1816,1818,3,208,104,0,1817,1819,5,140,0,0,1818,1817,1,0,0,0,1818,
        1819,1,0,0,0,1819,1820,1,0,0,0,1820,1822,5,2,0,0,1821,1823,5,140,
        0,0,1822,1821,1,0,0,0,1822,1823,1,0,0,0,1823,1824,1,0,0,0,1824,1826,
        3,134,67,0,1825,1827,5,140,0,0,1826,1825,1,0,0,0,1826,1827,1,0,0,
        0,1827,1828,1,0,0,0,1828,1830,5,5,0,0,1829,1831,5,140,0,0,1830,1829,
        1,0,0,0,1830,1831,1,0,0,0,1831,1832,1,0,0,0,1832,1834,3,188,94,0,
        1833,1835,5,140,0,0,1834,1833,1,0,0,0,1834,1835,1,0,0,0,1835,1836,
        1,0,0,0,1836,1838,5,7,0,0,1837,1839,5,140,0,0,1838,1837,1,0,0,0,
        1838,1839,1,0,0,0,1839,1840,1,0,0,0,1840,1842,3,134,67,0,1841,1843,
        5,140,0,0,1842,1841,1,0,0,0,1842,1843,1,0,0,0,1843,1844,1,0,0,0,
        1844,1845,5,6,0,0,1845,191,1,0,0,0,1846,1848,3,194,97,0,1847,1849,
        5,140,0,0,1848,1847,1,0,0,0,1848,1849,1,0,0,0,1849,1850,1,0,0,0,
        1850,1852,5,4,0,0,1851,1853,5,140,0,0,1852,1851,1,0,0,0,1852,1853,
        1,0,0,0,1853,1858,1,0,0,0,1854,1856,5,74,0,0,1855,1857,5,140,0,0,
        1856,1855,1,0,0,0,1856,1857,1,0,0,0,1857,1859,1,0,0,0,1858,1854,
        1,0,0,0,1858,1859,1,0,0,0,1859,1877,1,0,0,0,1860,1862,3,134,67,0,
        1861,1863,5,140,0,0,1862,1861,1,0,0,0,1862,1863,1,0,0,0,1863,1874,
        1,0,0,0,1864,1866,5,5,0,0,1865,1867,5,140,0,0,1866,1865,1,0,0,0,
        1866,1867,1,0,0,0,1867,1868,1,0,0,0,1868,1870,3,134,67,0,1869,1871,
        5,140,0,0,1870,1869,1,0,0,0,1870,1871,1,0,0,0,1871,1873,1,0,0,0,
        1872,1864,1,0,0,0,1873,1876,1,0,0,0,1874,1872,1,0,0,0,1874,1875,
        1,0,0,0,1875,1878,1,0,0,0,1876,1874,1,0,0,0,1877,1860,1,0,0,0,1877,
        1878,1,0,0,0,1878,1879,1,0,0,0,1879,1880,5,6,0,0,1880,193,1,0,0,
        0,1881,1882,3,206,103,0,1882,1883,3,232,116,0,1883,195,1,0,0,0,1884,
        1886,5,106,0,0,1885,1887,5,140,0,0,1886,1885,1,0,0,0,1886,1887,1,
        0,0,0,1887,1888,1,0,0,0,1888,1890,5,8,0,0,1889,1891,5,140,0,0,1890,
        1889,1,0,0,0,1890,1891,1,0,0,0,1891,1908,1,0,0,0,1892,1909,3,26,
        13,0,1893,1895,3,38,19,0,1894,1896,5,140,0,0,1895,1894,1,0,0,0,1895,
        1896,1,0,0,0,1896,1898,1,0,0,0,1897,1893,1,0,0,0,1898,1899,1,0,0,
        0,1899,1897,1,0,0,0,1899,1900,1,0,0,0,1900,1909,1,0,0,0,1901,1906,
        3,98,49,0,1902,1904,5,140,0,0,1903,1902,1,0,0,0,1903,1904,1,0,0,
        0,1904,1905,1,0,0,0,1905,1907,3,96,48,0,1906,1903,1,0,0,0,1906,1907,
        1,0,0,0,1907,1909,1,0,0,0,1908,1892,1,0,0,0,1908,1897,1,0,0,0,1908,
        1901,1,0,0,0,1909,1911,1,0,0,0,1910,1912,5,140,0,0,1911,1910,1,0,
        0,0,1911,1912,1,0,0,0,1912,1913,1,0,0,0,1913,1914,5,9,0,0,1914,197,
        1,0,0,0,1915,1917,3,204,102,0,1916,1918,5,140,0,0,1917,1916,1,0,
        0,0,1917,1918,1,0,0,0,1918,1919,1,0,0,0,1919,1921,5,4,0,0,1920,1922,
        5,140,0,0,1921,1920,1,0,0,0,1921,1922,1,0,0,0,1922,1940,1,0,0,0,
        1923,1925,3,134,67,0,1924,1926,5,140,0,0,1925,1924,1,0,0,0,1925,
        1926,1,0,0,0,1926,1937,1,0,0,0,1927,1929,5,5,0,0,1928,1930,5,140,
        0,0,1929,1928,1,0,0,0,1929,1930,1,0,0,0,1930,1931,1,0,0,0,1931,1933,
        3,134,67,0,1932,1934,5,140,0,0,1933,1932,1,0,0,0,1933,1934,1,0,0,
        0,1934,1936,1,0,0,0,1935,1927,1,0,0,0,1936,1939,1,0,0,0,1937,1935,
        1,0,0,0,1937,1938,1,0,0,0,1938,1941,1,0,0,0,1939,1937,1,0,0,0,1940,
        1923,1,0,0,0,1940,1941,1,0,0,0,1941,1942,1,0,0,0,1942,1943,5,6,0,
        0,1943,199,1,0,0,0,1944,1945,3,204,102,0,1945,201,1,0,0,0,1946,1947,
        3,232,116,0,1947,203,1,0,0,0,1948,1949,3,206,103,0,1949,1950,3,232,
        116,0,1950,205,1,0,0,0,1951,1952,3,232,116,0,1952,1953,5,12,0,0,
        1953,1955,1,0,0,0,1954,1951,1,0,0,0,1955,1958,1,0,0,0,1956,1954,
        1,0,0,0,1956,1957,1,0,0,0,1957,207,1,0,0,0,1958,1956,1,0,0,0,1959,
        1960,3,232,116,0,1960,209,1,0,0,0,1961,1968,3,212,106,0,1962,1968,
        5,95,0,0,1963,1968,3,214,107,0,1964,1968,5,121,0,0,1965,1968,3,220,
        110,0,1966,1968,3,222,111,0,1967,1961,1,0,0,0,1967,1962,1,0,0,0,
        1967,1963,1,0,0,0,1967,1964,1,0,0,0,1967,1965,1,0,0,0,1967,1966,
        1,0,0,0,1968,211,1,0,0,0,1969,1970,7,4,0,0,1970,213,1,0,0,0,1971,
        1974,3,218,109,0,1972,1974,3,216,108,0,1973,1971,1,0,0,0,1973,1972,
        1,0,0,0,1974,215,1,0,0,0,1975,1976,7,5,0,0,1976,217,1,0,0,0,1977,
        1978,7,6,0,0,1978,219,1,0,0,0,1979,1981,5,13,0,0,1980,1982,5,140,
        0,0,1981,1980,1,0,0,0,1981,1982,1,0,0,0,1982,2000,1,0,0,0,1983,1985,
        3,134,67,0,1984,1986,5,140,0,0,1985,1984,1,0,0,0,1985,1986,1,0,0,
        0,1986,1997,1,0,0,0,1987,1989,5,5,0,0,1988,1990,5,140,0,0,1989,1988,
        1,0,0,0,1989,1990,1,0,0,0,1990,1991,1,0,0,0,1991,1993,3,134,67,0,
        1992,1994,5,140,0,0,1993,1992,1,0,0,0,1993,1994,1,0,0,0,1994,1996,
        1,0,0,0,1995,1987,1,0,0,0,1996,1999,1,0,0,0,1997,1995,1,0,0,0,1997,
        1998,1,0,0,0,1998,2001,1,0,0,0,1999,1997,1,0,0,0,2000,1983,1,0,0,
        0,2000,2001,1,0,0,0,2001,2002,1,0,0,0,2002,2003,5,14,0,0,2003,221,
        1,0,0,0,2004,2006,5,8,0,0,2005,2007,5,140,0,0,2006,2005,1,0,0,0,
        2006,2007,1,0,0,0,2007,2041,1,0,0,0,2008,2010,3,224,112,0,2009,2011,
        5,140,0,0,2010,2009,1,0,0,0,2010,2011,1,0,0,0,2011,2012,1,0,0,0,
        2012,2014,5,3,0,0,2013,2015,5,140,0,0,2014,2013,1,0,0,0,2014,2015,
        1,0,0,0,2015,2016,1,0,0,0,2016,2018,3,134,67,0,2017,2019,5,140,0,
        0,2018,2017,1,0,0,0,2018,2019,1,0,0,0,2019,2038,1,0,0,0,2020,2022,
        5,5,0,0,2021,2023,5,140,0,0,2022,2021,1,0,0,0,2022,2023,1,0,0,0,
        2023,2024,1,0,0,0,2024,2026,3,224,112,0,2025,2027,5,140,0,0,2026,
        2025,1,0,0,0,2026,2027,1,0,0,0,2027,2028,1,0,0,0,2028,2030,5,3,0,
        0,2029,2031,5,140,0,0,2030,2029,1,0,0,0,2030,2031,1,0,0,0,2031,2032,
        1,0,0,0,2032,2034,3,134,67,0,2033,2035,5,140,0,0,2034,2033,1,0,0,
        0,2034,2035,1,0,0,0,2035,2037,1,0,0,0,2036,2020,1,0,0,0,2037,2040,
        1,0,0,0,2038,2036,1,0,0,0,2038,2039,1,0,0,0,2039,2042,1,0,0,0,2040,
        2038,1,0,0,0,2041,2008,1,0,0,0,2041,2042,1,0,0,0,2042,2043,1,0,0,
        0,2043,2044,5,9,0,0,2044,223,1,0,0,0,2045,2046,3,228,114,0,2046,
        225,1,0,0,0,2047,2050,5,26,0,0,2048,2051,3,232,116,0,2049,2051,5,
        110,0,0,2050,2048,1,0,0,0,2050,2049,1,0,0,0,2051,227,1,0,0,0,2052,
        2055,3,232,116,0,2053,2055,3,230,115,0,2054,2052,1,0,0,0,2054,2053,
        1,0,0,0,2055,229,1,0,0,0,2056,2057,7,7,0,0,2057,231,1,0,0,0,2058,
        2059,7,8,0,0,2059,233,1,0,0,0,2060,2061,7,9,0,0,2061,235,1,0,0,0,
        2062,2063,7,10,0,0,2063,237,1,0,0,0,2064,2065,7,11,0,0,2065,239,
        1,0,0,0,382,241,248,252,256,261,264,267,273,277,286,292,300,304,
        308,312,316,320,323,329,333,337,341,349,353,357,361,365,373,377,
        381,385,393,397,401,405,413,417,421,425,429,435,439,443,447,452,
        456,466,474,478,483,488,496,504,508,513,518,528,532,537,544,549,
        552,556,560,564,570,574,579,584,588,591,593,597,601,606,610,615,
        619,630,637,646,660,664,668,676,680,685,688,694,698,702,708,712,
        716,719,723,733,740,753,757,763,767,771,776,781,785,791,795,801,
        805,811,815,819,823,827,831,836,843,847,852,859,865,870,876,879,
        885,887,891,895,900,904,907,914,921,924,930,933,939,943,947,951,
        955,960,965,969,974,977,986,990,994,998,1003,1006,1009,1015,1020,
        1025,1029,1034,1043,1048,1061,1064,1072,1076,1081,1086,1090,1095,
        1099,1103,1107,1111,1117,1122,1129,1133,1138,1142,1146,1148,1152,
        1154,1158,1160,1166,1172,1176,1179,1182,1186,1192,1196,1199,1202,
        1208,1211,1214,1218,1224,1227,1230,1234,1238,1242,1244,1248,1250,
        1253,1257,1259,1265,1269,1273,1277,1280,1285,1290,1295,1300,1306,
        1310,1312,1316,1320,1322,1324,1332,1337,1348,1358,1368,1373,1377,
        1384,1389,1394,1399,1404,1409,1414,1419,1422,1428,1430,1443,1446,
        1453,1467,1471,1475,1479,1483,1486,1488,1493,1497,1501,1505,1509,
        1513,1516,1518,1523,1527,1532,1538,1541,1545,1549,1552,1554,1558,
        1561,1569,1573,1576,1580,1589,1593,1597,1611,1614,1616,1620,1625,
        1629,1633,1638,1640,1643,1647,1650,1653,1659,1663,1667,1673,1677,
        1681,1684,1687,1693,1697,1701,1703,1707,1711,1713,1717,1721,1727,
        1731,1735,1741,1745,1749,1755,1759,1763,1769,1773,1777,1781,1785,
        1788,1794,1798,1810,1814,1818,1822,1826,1830,1834,1838,1842,1848,
        1852,1856,1858,1862,1866,1870,1874,1877,1886,1890,1895,1899,1903,
        1906,1908,1911,1917,1921,1925,1929,1933,1937,1940,1956,1967,1973,
        1981,1985,1989,1993,1997,2000,2006,2010,2014,2018,2022,2026,2030,
        2034,2038,2041,2050,2054
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
    public CYPHER(): antlr.TerminalNode[];
    public CYPHER(i: number): antlr.TerminalNode | null;
    public CYPHER(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(CypherParser.CYPHER);
        } else {
            return this.getToken(CypherParser.CYPHER, i);
        }
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
    public oC_MapProjection(): OC_MapProjectionContext | null {
        return this.getRuleContext(0, OC_MapProjectionContext);
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
