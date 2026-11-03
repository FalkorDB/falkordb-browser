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
    public static readonly RULE_oC_Order = 42;
    public static readonly RULE_oC_Skip = 43;
    public static readonly RULE_oC_Limit = 44;
    public static readonly RULE_oC_SortItem = 45;
    public static readonly RULE_oC_Where = 46;
    public static readonly RULE_oC_Pattern = 47;
    public static readonly RULE_oC_PatternPart = 48;
    public static readonly RULE_oC_AnonymousPatternPart = 49;
    public static readonly RULE_oC_ShortestPathPattern = 50;
    public static readonly RULE_oC_PatternElement = 51;
    public static readonly RULE_oC_RelationshipsPattern = 52;
    public static readonly RULE_oC_NodePattern = 53;
    public static readonly RULE_oC_PatternElementChain = 54;
    public static readonly RULE_oC_RelationshipPattern = 55;
    public static readonly RULE_oC_RelationshipDetail = 56;
    public static readonly RULE_oC_Properties = 57;
    public static readonly RULE_oC_RelationshipTypes = 58;
    public static readonly RULE_oC_NodeLabels = 59;
    public static readonly RULE_oC_NodeLabel = 60;
    public static readonly RULE_oC_RangeLiteral = 61;
    public static readonly RULE_oC_LabelName = 62;
    public static readonly RULE_oC_RelTypeName = 63;
    public static readonly RULE_oC_PropertyExpression = 64;
    public static readonly RULE_oC_Expression = 65;
    public static readonly RULE_oC_OrExpression = 66;
    public static readonly RULE_oC_XorExpression = 67;
    public static readonly RULE_oC_AndExpression = 68;
    public static readonly RULE_oC_NotExpression = 69;
    public static readonly RULE_oC_ComparisonExpression = 70;
    public static readonly RULE_oC_PartialComparisonExpression = 71;
    public static readonly RULE_oC_StringListNullPredicateExpression = 72;
    public static readonly RULE_oC_StringPredicateExpression = 73;
    public static readonly RULE_oC_ListPredicateExpression = 74;
    public static readonly RULE_oC_NullPredicateExpression = 75;
    public static readonly RULE_oC_AddOrSubtractExpression = 76;
    public static readonly RULE_oC_MultiplyDivideModuloExpression = 77;
    public static readonly RULE_oC_PowerOfExpression = 78;
    public static readonly RULE_oC_UnaryAddOrSubtractExpression = 79;
    public static readonly RULE_oC_NonArithmeticOperatorExpression = 80;
    public static readonly RULE_oC_ListOperatorExpression = 81;
    public static readonly RULE_oC_PropertyLookup = 82;
    public static readonly RULE_oC_Atom = 83;
    public static readonly RULE_oC_CaseExpression = 84;
    public static readonly RULE_oC_CaseAlternative = 85;
    public static readonly RULE_oC_ListComprehension = 86;
    public static readonly RULE_oC_PatternComprehension = 87;
    public static readonly RULE_oC_Quantifier = 88;
    public static readonly RULE_oC_FilterExpression = 89;
    public static readonly RULE_oC_PatternPredicate = 90;
    public static readonly RULE_oC_ParenthesizedExpression = 91;
    public static readonly RULE_oC_IdInColl = 92;
    public static readonly RULE_oC_ReduceExpression = 93;
    public static readonly RULE_oC_FunctionInvocation = 94;
    public static readonly RULE_oC_FunctionName = 95;
    public static readonly RULE_oC_ExistentialSubquery = 96;
    public static readonly RULE_oC_ExplicitProcedureInvocation = 97;
    public static readonly RULE_oC_ImplicitProcedureInvocation = 98;
    public static readonly RULE_oC_ProcedureResultField = 99;
    public static readonly RULE_oC_ProcedureName = 100;
    public static readonly RULE_oC_Namespace = 101;
    public static readonly RULE_oC_Variable = 102;
    public static readonly RULE_oC_Literal = 103;
    public static readonly RULE_oC_BooleanLiteral = 104;
    public static readonly RULE_oC_NumberLiteral = 105;
    public static readonly RULE_oC_IntegerLiteral = 106;
    public static readonly RULE_oC_DoubleLiteral = 107;
    public static readonly RULE_oC_ListLiteral = 108;
    public static readonly RULE_oC_MapLiteral = 109;
    public static readonly RULE_oC_PropertyKeyName = 110;
    public static readonly RULE_oC_Parameter = 111;
    public static readonly RULE_oC_SchemaName = 112;
    public static readonly RULE_oC_ReservedWord = 113;
    public static readonly RULE_oC_SymbolicName = 114;
    public static readonly RULE_oC_LeftArrowHead = 115;
    public static readonly RULE_oC_RightArrowHead = 116;
    public static readonly RULE_oC_Dash = 117;

    public static readonly literalNames = [
        null, "';'", "'='", "':'", "'('", "','", "')'", "'|'", "'{'", "'}'",
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
        "oC_ProjectionItem", "oC_Order", "oC_Skip", "oC_Limit", "oC_SortItem",
        "oC_Where", "oC_Pattern", "oC_PatternPart", "oC_AnonymousPatternPart",
        "oC_ShortestPathPattern", "oC_PatternElement", "oC_RelationshipsPattern",
        "oC_NodePattern", "oC_PatternElementChain", "oC_RelationshipPattern",
        "oC_RelationshipDetail", "oC_Properties", "oC_RelationshipTypes",
        "oC_NodeLabels", "oC_NodeLabel", "oC_RangeLiteral", "oC_LabelName",
        "oC_RelTypeName", "oC_PropertyExpression", "oC_Expression", "oC_OrExpression",
        "oC_XorExpression", "oC_AndExpression", "oC_NotExpression", "oC_ComparisonExpression",
        "oC_PartialComparisonExpression", "oC_StringListNullPredicateExpression",
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
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 237;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 236;
                this.match(CypherParser.SP);
                }
            }

            this.state = 252;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 135) {
                {
                {
                this.state = 239;
                this.match(CypherParser.CYPHER);
                this.state = 244;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 1, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 240;
                        this.match(CypherParser.SP);
                        this.state = 241;
                        this.oC_ParameterHeader();
                        }
                        }
                    }
                    this.state = 246;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 1, this.context);
                }
                this.state = 248;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 247;
                    this.match(CypherParser.SP);
                    }
                }

                }
                }
                this.state = 254;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 255;
            this.oC_Statement();
            this.state = 260;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 5, this.context) ) {
            case 1:
                {
                this.state = 257;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 256;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 259;
                this.match(CypherParser.T__0);
                }
                break;
            }
            this.state = 263;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 262;
                this.match(CypherParser.SP);
                }
            }

            this.state = 265;
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
            this.state = 267;
            this.oC_SchemaName();
            this.state = 269;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 268;
                this.match(CypherParser.SP);
                }
            }

            this.state = 271;
            this.match(CypherParser.T__1);
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
            this.state = 277;
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
            this.state = 282;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 9, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 279;
                this.oC_RegularQuery();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 280;
                this.oC_StandaloneCall();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 281;
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
            this.state = 288;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 10, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 284;
                this.oC_CreateIndex();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 285;
                this.oC_DropIndex();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 286;
                this.oC_CreateConstraint();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 287;
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
            this.state = 361;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 26, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 290;
                this.match(CypherParser.CREATE);
                this.state = 291;
                this.match(CypherParser.SP);
                this.state = 292;
                this.oC_IndexQualifier();
                this.state = 293;
                this.match(CypherParser.SP);
                this.state = 294;
                this.match(CypherParser.INDEX);
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
                this.match(CypherParser.FOR);
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
                this.oC_IndexEntity();
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
                this.match(CypherParser.ON);
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
                this.oC_IndexProperties();
                this.state = 319;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 17, this.context) ) {
                case 1:
                    {
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
                    this.match(CypherParser.OPTIONS);
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
                    this.oC_MapLiteral();
                    }
                    break;
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 321;
                this.match(CypherParser.CREATE);
                this.state = 322;
                this.match(CypherParser.SP);
                this.state = 323;
                this.match(CypherParser.INDEX);
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
                this.match(CypherParser.FOR);
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
                this.oC_IndexEntity();
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
                this.match(CypherParser.ON);
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
                this.oC_IndexProperties();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 341;
                this.match(CypherParser.CREATE);
                this.state = 342;
                this.match(CypherParser.SP);
                this.state = 343;
                this.match(CypherParser.INDEX);
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
                this.match(CypherParser.ON);
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
                this.match(CypherParser.T__2);
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
                this.oC_LabelName();
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
            this.state = 425;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 39, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 363;
                this.match(CypherParser.DROP);
                this.state = 364;
                this.match(CypherParser.SP);
                this.state = 365;
                this.oC_IndexQualifier();
                this.state = 366;
                this.match(CypherParser.SP);
                this.state = 367;
                this.match(CypherParser.INDEX);
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
                this.match(CypherParser.FOR);
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
                this.oC_IndexEntity();
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
                this.match(CypherParser.ON);
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
                this.oC_IndexProperties();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 385;
                this.match(CypherParser.DROP);
                this.state = 386;
                this.match(CypherParser.SP);
                this.state = 387;
                this.match(CypherParser.INDEX);
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
                this.match(CypherParser.FOR);
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
                this.oC_IndexEntity();
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
                this.match(CypherParser.ON);
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
                this.oC_IndexProperties();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 405;
                this.match(CypherParser.DROP);
                this.state = 406;
                this.match(CypherParser.SP);
                this.state = 407;
                this.match(CypherParser.INDEX);
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
                this.match(CypherParser.ON);
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
                this.match(CypherParser.T__2);
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
                this.oC_LabelName();
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
            this.state = 427;
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
            this.state = 431;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 40, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 429;
                this.oC_NodePattern();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 430;
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
            this.state = 448;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 44, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
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
                    this.match(CypherParser.T__4);
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
                    this.oC_Expression();
                    }
                    }
                }
                this.state = 450;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 44, this.context);
            }
            this.state = 452;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 451;
                this.match(CypherParser.SP);
                }
            }

            this.state = 454;
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
            this.state = 456;
            this.match(CypherParser.CREATE);
            this.state = 457;
            this.match(CypherParser.SP);
            this.state = 458;
            this.match(CypherParser.CONSTRAINT);
            this.state = 459;
            this.match(CypherParser.SP);
            this.state = 460;
            this.match(CypherParser.ON);
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
            this.oC_IndexEntity();
            this.state = 465;
            this.match(CypherParser.SP);
            this.state = 466;
            this.match(CypherParser.ASSERT);
            this.state = 467;
            this.match(CypherParser.SP);
            this.state = 468;
            this.oC_Expression();
            this.state = 479;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 49, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 470;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 469;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 472;
                    this.match(CypherParser.T__4);
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
                    this.oC_Expression();
                    }
                    }
                }
                this.state = 481;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 49, this.context);
            }
            this.state = 484;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 50, this.context) ) {
            case 1:
                {
                this.state = 482;
                this.match(CypherParser.SP);
                this.state = 483;
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
            this.state = 486;
            this.match(CypherParser.DROP);
            this.state = 487;
            this.match(CypherParser.SP);
            this.state = 488;
            this.match(CypherParser.CONSTRAINT);
            this.state = 489;
            this.match(CypherParser.SP);
            this.state = 490;
            this.match(CypherParser.ON);
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
            this.oC_IndexEntity();
            this.state = 495;
            this.match(CypherParser.SP);
            this.state = 496;
            this.match(CypherParser.ASSERT);
            this.state = 497;
            this.match(CypherParser.SP);
            this.state = 498;
            this.oC_Expression();
            this.state = 509;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 54, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 500;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 499;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 502;
                    this.match(CypherParser.T__4);
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
                    this.oC_Expression();
                    }
                    }
                }
                this.state = 511;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 54, this.context);
            }
            this.state = 514;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 55, this.context) ) {
            case 1:
                {
                this.state = 512;
                this.match(CypherParser.SP);
                this.state = 513;
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
            this.state = 524;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 56, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 516;
                this.match(CypherParser.IS);
                this.state = 517;
                this.match(CypherParser.SP);
                this.state = 518;
                this.match(CypherParser.UNIQUE);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 519;
                this.match(CypherParser.IS);
                this.state = 520;
                this.match(CypherParser.SP);
                this.state = 521;
                this.match(CypherParser.NOT);
                this.state = 522;
                this.match(CypherParser.SP);
                this.state = 523;
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
            this.state = 526;
            this.oC_SingleQuery();
            this.state = 533;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 58, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 528;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 527;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 530;
                    this.oC_Union();
                    }
                    }
                }
                this.state = 535;
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
            this.state = 548;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 61, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 536;
                this.match(CypherParser.UNION);
                this.state = 537;
                this.match(CypherParser.SP);
                this.state = 538;
                this.match(CypherParser.ALL);
                this.state = 540;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 539;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 542;
                this.oC_SingleQuery();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 543;
                this.match(CypherParser.UNION);
                this.state = 545;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 544;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 547;
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
            this.state = 552;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 62, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 550;
                this.oC_SinglePartQuery();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 551;
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
            this.state = 589;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 71, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 560;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (((((_la - 53)) & ~0x1F) === 0 && ((1 << (_la - 53)) & 131521) !== 0)) {
                    {
                    {
                    this.state = 554;
                    this.oC_ReadingClause();
                    this.state = 556;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 555;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 562;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 563;
                this.oC_Return();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 570;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 66, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 564;
                        this.oC_ReadingClause();
                        this.state = 566;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 565;
                            this.match(CypherParser.SP);
                            }
                        }

                        }
                        }
                    }
                    this.state = 572;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 66, this.context);
                }
                this.state = 573;
                this.oC_UpdatingClause();
                this.state = 580;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 68, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 575;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 574;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 577;
                        this.oC_UpdatingClause();
                        }
                        }
                    }
                    this.state = 582;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 68, this.context);
                }
                this.state = 587;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 70, this.context) ) {
                case 1:
                    {
                    this.state = 584;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 583;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 586;
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
            this.state = 613;
            this.errorHandler.sync(this);
            alternative = 1;
            do {
                switch (alternative) {
                case 1:
                    {
                    {
                    this.state = 597;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 73, this.context);
                    while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                        if (alternative === 1) {
                            {
                            {
                            this.state = 591;
                            this.oC_ReadingClause();
                            this.state = 593;
                            this.errorHandler.sync(this);
                            _la = this.tokenStream.LA(1);
                            if (_la === 140) {
                                {
                                this.state = 592;
                                this.match(CypherParser.SP);
                                }
                            }

                            }
                            }
                        }
                        this.state = 599;
                        this.errorHandler.sync(this);
                        alternative = this.interpreter.adaptivePredict(this.tokenStream, 73, this.context);
                    }
                    this.state = 606;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    while (((((_la - 58)) & ~0x1F) === 0 && ((1 << (_la - 58)) & 8097) !== 0)) {
                        {
                        {
                        this.state = 600;
                        this.oC_UpdatingClause();
                        this.state = 602;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 601;
                            this.match(CypherParser.SP);
                            }
                        }

                        }
                        }
                        this.state = 608;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                    }
                    this.state = 609;
                    this.oC_With();
                    this.state = 611;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 610;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 615;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 77, this.context);
            } while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER);
            this.state = 617;
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
            this.state = 626;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.CREATE:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 619;
                this.oC_Create();
                }
                break;
            case CypherParser.MERGE:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 620;
                this.oC_Merge();
                }
                break;
            case CypherParser.DETACH:
            case CypherParser.DELETE:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 621;
                this.oC_Delete();
                }
                break;
            case CypherParser.SET:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 622;
                this.oC_Set();
                }
                break;
            case CypherParser.REMOVE:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 623;
                this.oC_Remove();
                }
                break;
            case CypherParser.FOREACH:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 624;
                this.oC_Foreach();
                }
                break;
            case CypherParser.CALL:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 625;
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
            this.state = 633;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 79, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 628;
                this.oC_Match();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 629;
                this.oC_Unwind();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 630;
                this.oC_InQueryCall();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 631;
                this.oC_CallSubquery();
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 632;
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
            this.state = 635;
            this.match(CypherParser.LOAD);
            this.state = 636;
            this.match(CypherParser.SP);
            this.state = 637;
            this.match(CypherParser.CSV);
            this.state = 642;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 80, this.context) ) {
            case 1:
                {
                this.state = 638;
                this.match(CypherParser.SP);
                this.state = 639;
                this.match(CypherParser.WITH);
                this.state = 640;
                this.match(CypherParser.SP);
                this.state = 641;
                this.match(CypherParser.HEADERS);
                }
                break;
            }
            this.state = 644;
            this.match(CypherParser.SP);
            this.state = 645;
            this.match(CypherParser.FROM);
            this.state = 646;
            this.match(CypherParser.SP);
            this.state = 647;
            this.oC_Expression();
            this.state = 648;
            this.match(CypherParser.SP);
            this.state = 649;
            this.match(CypherParser.AS);
            this.state = 650;
            this.match(CypherParser.SP);
            this.state = 651;
            this.oC_Variable();
            this.state = 656;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 81, this.context) ) {
            case 1:
                {
                this.state = 652;
                this.match(CypherParser.SP);
                this.state = 653;
                this.match(CypherParser.FIELDTERMINATOR);
                this.state = 654;
                this.match(CypherParser.SP);
                this.state = 655;
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
            this.state = 658;
            this.match(CypherParser.FOREACH);
            this.state = 660;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 659;
                this.match(CypherParser.SP);
                }
            }

            this.state = 662;
            this.match(CypherParser.T__3);
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
            this.oC_Variable();
            this.state = 667;
            this.match(CypherParser.SP);
            this.state = 668;
            this.match(CypherParser.IN);
            this.state = 669;
            this.match(CypherParser.SP);
            this.state = 670;
            this.oC_Expression();
            this.state = 672;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 671;
                this.match(CypherParser.SP);
                }
            }

            this.state = 674;
            this.match(CypherParser.T__6);
            this.state = 679;
            this.errorHandler.sync(this);
            alternative = 1;
            do {
                switch (alternative) {
                case 1:
                    {
                    {
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
                    this.oC_UpdatingClause();
                    }
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 681;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 86, this.context);
            } while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER);
            this.state = 684;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 683;
                this.match(CypherParser.SP);
                }
            }

            this.state = 686;
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
            this.state = 688;
            this.match(CypherParser.CALL);
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
            this.oC_RegularQuery();
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
            this.state = 704;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 59) {
                {
                this.state = 702;
                this.match(CypherParser.OPTIONAL);
                this.state = 703;
                this.match(CypherParser.SP);
                }
            }

            this.state = 706;
            this.match(CypherParser.MATCH);
            this.state = 708;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 707;
                this.match(CypherParser.SP);
                }
            }

            this.state = 710;
            this.oC_Pattern();
            this.state = 715;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 94, this.context) ) {
            case 1:
                {
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
            this.state = 717;
            this.match(CypherParser.UNWIND);
            this.state = 719;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 718;
                this.match(CypherParser.SP);
                }
            }

            this.state = 721;
            this.oC_Expression();
            this.state = 722;
            this.match(CypherParser.SP);
            this.state = 723;
            this.match(CypherParser.AS);
            this.state = 724;
            this.match(CypherParser.SP);
            this.state = 725;
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
            this.state = 727;
            this.match(CypherParser.MERGE);
            this.state = 729;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 728;
                this.match(CypherParser.SP);
                }
            }

            this.state = 731;
            this.oC_PatternPart();
            this.state = 736;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 97, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 732;
                    this.match(CypherParser.SP);
                    this.state = 733;
                    this.oC_MergeAction();
                    }
                    }
                }
                this.state = 738;
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
            this.state = 749;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 98, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 739;
                this.match(CypherParser.ON);
                this.state = 740;
                this.match(CypherParser.SP);
                this.state = 741;
                this.match(CypherParser.MATCH);
                this.state = 742;
                this.match(CypherParser.SP);
                this.state = 743;
                this.oC_Set();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 744;
                this.match(CypherParser.ON);
                this.state = 745;
                this.match(CypherParser.SP);
                this.state = 746;
                this.match(CypherParser.CREATE);
                this.state = 747;
                this.match(CypherParser.SP);
                this.state = 748;
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
            this.state = 751;
            this.match(CypherParser.CREATE);
            this.state = 753;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 752;
                this.match(CypherParser.SP);
                }
            }

            this.state = 755;
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
            this.state = 757;
            this.match(CypherParser.SET);
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
            this.state = 772;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 103, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
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
                    this.match(CypherParser.T__4);
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
                    this.oC_SetItem();
                    }
                    }
                }
                this.state = 774;
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
            this.state = 811;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 111, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 775;
                this.oC_PropertyExpression();
                this.state = 777;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 776;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 779;
                this.match(CypherParser.T__1);
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
                this.oC_Expression();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 785;
                this.oC_Variable();
                this.state = 787;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 786;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 789;
                this.match(CypherParser.T__1);
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
                this.oC_Expression();
                }
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                {
                this.state = 795;
                this.oC_Variable();
                this.state = 797;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 796;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 799;
                this.match(CypherParser.T__9);
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
                this.oC_Expression();
                }
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 805;
                this.oC_Variable();
                this.state = 807;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 806;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 809;
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
            this.state = 815;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 67) {
                {
                this.state = 813;
                this.match(CypherParser.DETACH);
                this.state = 814;
                this.match(CypherParser.SP);
                }
            }

            this.state = 817;
            this.match(CypherParser.DELETE);
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
            this.state = 832;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 116, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
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
                    this.match(CypherParser.T__4);
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
                    this.oC_Expression();
                    }
                    }
                }
                this.state = 834;
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
            this.state = 835;
            this.match(CypherParser.REMOVE);
            this.state = 836;
            this.match(CypherParser.SP);
            this.state = 837;
            this.oC_RemoveItem();
            this.state = 848;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 119, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 839;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 838;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 841;
                    this.match(CypherParser.T__4);
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
                    this.oC_RemoveItem();
                    }
                    }
                }
                this.state = 850;
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
            this.state = 855;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 120, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 851;
                this.oC_Variable();
                this.state = 852;
                this.oC_NodeLabels();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 854;
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
            this.state = 857;
            this.match(CypherParser.CALL);
            this.state = 858;
            this.match(CypherParser.SP);
            this.state = 859;
            this.oC_ExplicitProcedureInvocation();
            this.state = 866;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 122, this.context) ) {
            case 1:
                {
                this.state = 861;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 860;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 863;
                this.match(CypherParser.YIELD);
                this.state = 864;
                this.match(CypherParser.SP);
                this.state = 865;
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
            this.state = 868;
            this.match(CypherParser.CALL);
            this.state = 869;
            this.match(CypherParser.SP);
            this.state = 872;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 123, this.context) ) {
            case 1:
                {
                this.state = 870;
                this.oC_ExplicitProcedureInvocation();
                }
                break;
            case 2:
                {
                this.state = 871;
                this.oC_ImplicitProcedureInvocation();
                }
                break;
            }
            this.state = 883;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 126, this.context) ) {
            case 1:
                {
                this.state = 875;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 874;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 877;
                this.match(CypherParser.YIELD);
                this.state = 878;
                this.match(CypherParser.SP);
                this.state = 881;
                this.errorHandler.sync(this);
                switch (this.tokenStream.LA(1)) {
                case CypherParser.T__10:
                    {
                    this.state = 879;
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
                case CypherParser.CYPHER:
                case CypherParser.UnescapedSymbolicName:
                case CypherParser.EscapedSymbolicName:
                    {
                    this.state = 880;
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
            this.state = 885;
            this.oC_YieldItem();
            this.state = 896;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 129, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 887;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 886;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 889;
                    this.match(CypherParser.T__4);
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
                    this.oC_YieldItem();
                    }
                    }
                }
                this.state = 898;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 129, this.context);
            }
            this.state = 903;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 131, this.context) ) {
            case 1:
                {
                this.state = 900;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 899;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 902;
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
            this.state = 910;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 132, this.context) ) {
            case 1:
                {
                this.state = 905;
                this.oC_ProcedureResultField();
                this.state = 906;
                this.match(CypherParser.SP);
                this.state = 907;
                this.match(CypherParser.AS);
                this.state = 908;
                this.match(CypherParser.SP);
                }
                break;
            }
            this.state = 912;
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
            this.state = 914;
            this.match(CypherParser.WITH);
            this.state = 915;
            this.oC_ProjectionBody();
            this.state = 920;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 134, this.context) ) {
            case 1:
                {
                this.state = 917;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 916;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 919;
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
            this.state = 922;
            this.match(CypherParser.RETURN);
            this.state = 923;
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
            this.state = 929;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 136, this.context) ) {
            case 1:
                {
                this.state = 926;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 925;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 928;
                this.match(CypherParser.DISTINCT);
                }
                break;
            }
            this.state = 931;
            this.match(CypherParser.SP);
            this.state = 932;
            this.oC_ProjectionItems();
            this.state = 935;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 137, this.context) ) {
            case 1:
                {
                this.state = 933;
                this.match(CypherParser.SP);
                this.state = 934;
                this.oC_Order();
                }
                break;
            }
            this.state = 939;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 138, this.context) ) {
            case 1:
                {
                this.state = 937;
                this.match(CypherParser.SP);
                this.state = 938;
                this.oC_Skip();
                }
                break;
            }
            this.state = 943;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 139, this.context) ) {
            case 1:
                {
                this.state = 941;
                this.match(CypherParser.SP);
                this.state = 942;
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
            this.state = 973;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.T__10:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 945;
                this.match(CypherParser.T__10);
                this.state = 956;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 142, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 947;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 946;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 949;
                        this.match(CypherParser.T__4);
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
                        this.oC_ProjectionItem();
                        }
                        }
                    }
                    this.state = 958;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 142, this.context);
                }
                }
                }
                break;
            case CypherParser.T__3:
            case CypherParser.T__7:
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
            case CypherParser.CYPHER:
            case CypherParser.UnescapedSymbolicName:
            case CypherParser.EscapedSymbolicName:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 959;
                this.oC_ProjectionItem();
                this.state = 970;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 145, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 961;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 960;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 963;
                        this.match(CypherParser.T__4);
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
                        this.oC_ProjectionItem();
                        }
                        }
                    }
                    this.state = 972;
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
            this.state = 982;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 147, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 975;
                this.oC_Expression();
                this.state = 976;
                this.match(CypherParser.SP);
                this.state = 977;
                this.match(CypherParser.AS);
                this.state = 978;
                this.match(CypherParser.SP);
                this.state = 979;
                this.oC_Variable();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 981;
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
        this.enterRule(localContext, 84, CypherParser.RULE_oC_Order);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 984;
            this.match(CypherParser.ORDER);
            this.state = 985;
            this.match(CypherParser.SP);
            this.state = 986;
            this.match(CypherParser.BY);
            this.state = 987;
            this.match(CypherParser.SP);
            this.state = 988;
            this.oC_SortItem();
            this.state = 996;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 5) {
                {
                {
                this.state = 989;
                this.match(CypherParser.T__4);
                this.state = 991;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 990;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 993;
                this.oC_SortItem();
                }
                }
                this.state = 998;
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
        this.enterRule(localContext, 86, CypherParser.RULE_oC_Skip);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 999;
            this.match(CypherParser.L_SKIP);
            this.state = 1000;
            this.match(CypherParser.SP);
            this.state = 1001;
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
        this.enterRule(localContext, 88, CypherParser.RULE_oC_Limit);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1003;
            this.match(CypherParser.LIMIT);
            this.state = 1004;
            this.match(CypherParser.SP);
            this.state = 1005;
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
        this.enterRule(localContext, 90, CypherParser.RULE_oC_SortItem);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1007;
            this.oC_Expression();
            this.state = 1012;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 151, this.context) ) {
            case 1:
                {
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
        this.enterRule(localContext, 92, CypherParser.RULE_oC_Where);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1014;
            this.match(CypherParser.WHERE);
            this.state = 1015;
            this.match(CypherParser.SP);
            this.state = 1016;
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
        this.enterRule(localContext, 94, CypherParser.RULE_oC_Pattern);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1018;
            this.oC_PatternPart();
            this.state = 1029;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 154, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
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
                    this.match(CypherParser.T__4);
                    this.state = 1024;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1023;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1026;
                    this.oC_PatternPart();
                    }
                    }
                }
                this.state = 1031;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 154, this.context);
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
        this.enterRule(localContext, 96, CypherParser.RULE_oC_PatternPart);
        let _la: number;
        try {
            this.state = 1043;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 157, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1032;
                this.oC_Variable();
                this.state = 1034;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1033;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1036;
                this.match(CypherParser.T__1);
                this.state = 1038;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1037;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1040;
                this.oC_AnonymousPatternPart();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1042;
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
        this.enterRule(localContext, 98, CypherParser.RULE_oC_AnonymousPatternPart);
        try {
            this.state = 1047;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.SHORTESTPATH:
            case CypherParser.ALLSHORTESTPATHS:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1045;
                this.oC_ShortestPathPattern();
                }
                break;
            case CypherParser.T__3:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1046;
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
        this.enterRule(localContext, 100, CypherParser.RULE_oC_ShortestPathPattern);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1049;
            _la = this.tokenStream.LA(1);
            if(!(_la === 84 || _la === 85)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            this.state = 1051;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1050;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1053;
            this.match(CypherParser.T__3);
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
            this.oC_PatternElement();
            this.state = 1059;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1058;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1061;
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
        this.enterRule(localContext, 102, CypherParser.RULE_oC_PatternElement);
        let _la: number;
        try {
            let alternative: number;
            this.state = 1077;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 164, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1063;
                this.oC_NodePattern();
                this.state = 1070;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 163, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 1065;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1064;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1067;
                        this.oC_PatternElementChain();
                        }
                        }
                    }
                    this.state = 1072;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 163, this.context);
                }
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1073;
                this.match(CypherParser.T__3);
                this.state = 1074;
                this.oC_PatternElement();
                this.state = 1075;
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
        this.enterRule(localContext, 104, CypherParser.RULE_oC_RelationshipsPattern);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1079;
            this.oC_NodePattern();
            this.state = 1084;
            this.errorHandler.sync(this);
            alternative = 1;
            do {
                switch (alternative) {
                case 1:
                    {
                    {
                    this.state = 1081;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1080;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1083;
                    this.oC_PatternElementChain();
                    }
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 1086;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 166, this.context);
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
        this.enterRule(localContext, 106, CypherParser.RULE_oC_NodePattern);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1088;
            this.match(CypherParser.T__3);
            this.state = 1090;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1089;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1096;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 8392607) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 272371715) !== 0) || ((((_la - 132)) & ~0x1F) === 0 && ((1 << (_la - 132)) & 159) !== 0)) {
                {
                this.state = 1092;
                this.oC_Variable();
                this.state = 1094;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1093;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1102;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 3) {
                {
                this.state = 1098;
                this.oC_NodeLabels();
                this.state = 1100;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1099;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1108;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 8 || _la === 26) {
                {
                this.state = 1104;
                this.oC_Properties();
                this.state = 1106;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1105;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1110;
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
        this.enterRule(localContext, 108, CypherParser.RULE_oC_PatternElementChain);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1112;
            this.oC_RelationshipPattern();
            this.state = 1114;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1113;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1116;
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
        this.enterRule(localContext, 110, CypherParser.RULE_oC_RelationshipPattern);
        let _la: number;
        try {
            this.state = 1182;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 191, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1118;
                this.oC_LeftArrowHead();
                this.state = 1120;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1119;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1122;
                this.oC_Dash();
                this.state = 1124;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 176, this.context) ) {
                case 1:
                    {
                    this.state = 1123;
                    this.match(CypherParser.SP);
                    }
                    break;
                }
                this.state = 1127;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 12) {
                    {
                    this.state = 1126;
                    this.oC_RelationshipDetail();
                    }
                }

                this.state = 1130;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1129;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1132;
                this.oC_Dash();
                this.state = 1134;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1133;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1136;
                this.oC_RightArrowHead();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1138;
                this.oC_LeftArrowHead();
                this.state = 1140;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1139;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1142;
                this.oC_Dash();
                this.state = 1144;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 181, this.context) ) {
                case 1:
                    {
                    this.state = 1143;
                    this.match(CypherParser.SP);
                    }
                    break;
                }
                this.state = 1147;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 12) {
                    {
                    this.state = 1146;
                    this.oC_RelationshipDetail();
                    }
                }

                this.state = 1150;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1149;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1152;
                this.oC_Dash();
                }
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                {
                this.state = 1154;
                this.oC_Dash();
                this.state = 1156;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 184, this.context) ) {
                case 1:
                    {
                    this.state = 1155;
                    this.match(CypherParser.SP);
                    }
                    break;
                }
                this.state = 1159;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 12) {
                    {
                    this.state = 1158;
                    this.oC_RelationshipDetail();
                    }
                }

                this.state = 1162;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1161;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1164;
                this.oC_Dash();
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
                this.oC_RightArrowHead();
                }
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 1170;
                this.oC_Dash();
                this.state = 1172;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 188, this.context) ) {
                case 1:
                    {
                    this.state = 1171;
                    this.match(CypherParser.SP);
                    }
                    break;
                }
                this.state = 1175;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 12) {
                    {
                    this.state = 1174;
                    this.oC_RelationshipDetail();
                    }
                }

                this.state = 1178;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1177;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1180;
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
        this.enterRule(localContext, 112, CypherParser.RULE_oC_RelationshipDetail);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1184;
            this.match(CypherParser.T__11);
            this.state = 1186;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1185;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1192;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 8392607) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 272371715) !== 0) || ((((_la - 132)) & ~0x1F) === 0 && ((1 << (_la - 132)) & 159) !== 0)) {
                {
                this.state = 1188;
                this.oC_Variable();
                this.state = 1190;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1189;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1198;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 3) {
                {
                this.state = 1194;
                this.oC_RelationshipTypes();
                this.state = 1196;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1195;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1201;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 11) {
                {
                this.state = 1200;
                this.oC_RangeLiteral();
                }
            }

            this.state = 1207;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 8 || _la === 26) {
                {
                this.state = 1203;
                this.oC_Properties();
                this.state = 1205;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1204;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1209;
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
        this.enterRule(localContext, 114, CypherParser.RULE_oC_Properties);
        try {
            this.state = 1213;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.T__7:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1211;
                this.oC_MapLiteral();
                }
                break;
            case CypherParser.T__25:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1212;
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
        this.enterRule(localContext, 116, CypherParser.RULE_oC_RelationshipTypes);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1215;
            this.match(CypherParser.T__2);
            this.state = 1217;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1216;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1219;
            this.oC_RelTypeName();
            this.state = 1233;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 205, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1221;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1220;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1223;
                    this.match(CypherParser.T__6);
                    this.state = 1225;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 3) {
                        {
                        this.state = 1224;
                        this.match(CypherParser.T__2);
                        }
                    }

                    this.state = 1228;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1227;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1230;
                    this.oC_RelTypeName();
                    }
                    }
                }
                this.state = 1235;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 205, this.context);
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
        this.enterRule(localContext, 118, CypherParser.RULE_oC_NodeLabels);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1236;
            this.oC_NodeLabel();
            this.state = 1243;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 207, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1238;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1237;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1240;
                    this.oC_NodeLabel();
                    }
                    }
                }
                this.state = 1245;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 207, this.context);
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
        this.enterRule(localContext, 120, CypherParser.RULE_oC_NodeLabel);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1246;
            this.match(CypherParser.T__2);
            this.state = 1248;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1247;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1250;
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
        this.enterRule(localContext, 122, CypherParser.RULE_oC_RangeLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1252;
            this.match(CypherParser.T__10);
            this.state = 1254;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1253;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1260;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 109)) & ~0x1F) === 0 && ((1 << (_la - 109)) & 7) !== 0)) {
                {
                this.state = 1256;
                this.oC_IntegerLiteral();
                this.state = 1258;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1257;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1272;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 14) {
                {
                this.state = 1262;
                this.match(CypherParser.T__13);
                this.state = 1264;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1263;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1270;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (((((_la - 109)) & ~0x1F) === 0 && ((1 << (_la - 109)) & 7) !== 0)) {
                    {
                    this.state = 1266;
                    this.oC_IntegerLiteral();
                    this.state = 1268;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1267;
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
        this.enterRule(localContext, 124, CypherParser.RULE_oC_LabelName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1274;
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
        this.enterRule(localContext, 126, CypherParser.RULE_oC_RelTypeName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1276;
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
        this.enterRule(localContext, 128, CypherParser.RULE_oC_PropertyExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1278;
            this.oC_Atom();
            this.state = 1283;
            this.errorHandler.sync(this);
            alternative = 1;
            do {
                switch (alternative) {
                case 1:
                    {
                    {
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
                    this.oC_PropertyLookup();
                    }
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 1285;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 217, this.context);
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
        this.enterRule(localContext, 130, CypherParser.RULE_oC_Expression);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1287;
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
        this.enterRule(localContext, 132, CypherParser.RULE_oC_OrExpression);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1289;
            this.oC_XorExpression();
            this.state = 1296;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 218, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1290;
                    this.match(CypherParser.SP);
                    this.state = 1291;
                    this.match(CypherParser.OR);
                    this.state = 1292;
                    this.match(CypherParser.SP);
                    this.state = 1293;
                    this.oC_XorExpression();
                    }
                    }
                }
                this.state = 1298;
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
    public oC_XorExpression(): OC_XorExpressionContext {
        let localContext = new OC_XorExpressionContext(this.context, this.state);
        this.enterRule(localContext, 134, CypherParser.RULE_oC_XorExpression);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1299;
            this.oC_AndExpression();
            this.state = 1306;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 219, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1300;
                    this.match(CypherParser.SP);
                    this.state = 1301;
                    this.match(CypherParser.XOR);
                    this.state = 1302;
                    this.match(CypherParser.SP);
                    this.state = 1303;
                    this.oC_AndExpression();
                    }
                    }
                }
                this.state = 1308;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 219, this.context);
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
        this.enterRule(localContext, 136, CypherParser.RULE_oC_AndExpression);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1309;
            this.oC_NotExpression();
            this.state = 1316;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 220, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1310;
                    this.match(CypherParser.SP);
                    this.state = 1311;
                    this.match(CypherParser.AND);
                    this.state = 1312;
                    this.match(CypherParser.SP);
                    this.state = 1313;
                    this.oC_NotExpression();
                    }
                    }
                }
                this.state = 1318;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 220, this.context);
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
        this.enterRule(localContext, 138, CypherParser.RULE_oC_NotExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1325;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 89) {
                {
                {
                this.state = 1319;
                this.match(CypherParser.NOT);
                this.state = 1321;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1320;
                    this.match(CypherParser.SP);
                    }
                }

                }
                }
                this.state = 1327;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 1328;
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
        this.enterRule(localContext, 140, CypherParser.RULE_oC_ComparisonExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1330;
            this.oC_StringListNullPredicateExpression();
            this.state = 1337;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 224, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
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
                    this.oC_PartialComparisonExpression();
                    }
                    }
                }
                this.state = 1339;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 224, this.context);
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
        this.enterRule(localContext, 142, CypherParser.RULE_oC_PartialComparisonExpression);
        let _la: number;
        try {
            this.state = 1370;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.T__1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1340;
                this.match(CypherParser.T__1);
                this.state = 1342;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1341;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1344;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__14:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1345;
                this.match(CypherParser.T__14);
                this.state = 1347;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1346;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1349;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__15:
                this.enterOuterAlt(localContext, 3);
                {
                {
                this.state = 1350;
                this.match(CypherParser.T__15);
                this.state = 1352;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1351;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1354;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__16:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 1355;
                this.match(CypherParser.T__16);
                this.state = 1357;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1356;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1359;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__17:
                this.enterOuterAlt(localContext, 5);
                {
                {
                this.state = 1360;
                this.match(CypherParser.T__17);
                this.state = 1362;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1361;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1364;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__18:
                this.enterOuterAlt(localContext, 6);
                {
                {
                this.state = 1365;
                this.match(CypherParser.T__18);
                this.state = 1367;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1366;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1369;
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
        this.enterRule(localContext, 144, CypherParser.RULE_oC_StringListNullPredicateExpression);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1372;
            this.oC_AddOrSubtractExpression();
            this.state = 1378;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 233, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    this.state = 1376;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 232, this.context) ) {
                    case 1:
                        {
                        this.state = 1373;
                        this.oC_StringPredicateExpression();
                        }
                        break;
                    case 2:
                        {
                        this.state = 1374;
                        this.oC_ListPredicateExpression();
                        }
                        break;
                    case 3:
                        {
                        this.state = 1375;
                        this.oC_NullPredicateExpression();
                        }
                        break;
                    }
                    }
                }
                this.state = 1380;
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
    public oC_StringPredicateExpression(): OC_StringPredicateExpressionContext {
        let localContext = new OC_StringPredicateExpressionContext(this.context, this.state);
        this.enterRule(localContext, 146, CypherParser.RULE_oC_StringPredicateExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1391;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 234, this.context) ) {
            case 1:
                {
                {
                this.state = 1381;
                this.match(CypherParser.SP);
                this.state = 1382;
                this.match(CypherParser.STARTS);
                this.state = 1383;
                this.match(CypherParser.SP);
                this.state = 1384;
                this.match(CypherParser.WITH);
                }
                }
                break;
            case 2:
                {
                {
                this.state = 1385;
                this.match(CypherParser.SP);
                this.state = 1386;
                this.match(CypherParser.ENDS);
                this.state = 1387;
                this.match(CypherParser.SP);
                this.state = 1388;
                this.match(CypherParser.WITH);
                }
                }
                break;
            case 3:
                {
                {
                this.state = 1389;
                this.match(CypherParser.SP);
                this.state = 1390;
                this.match(CypherParser.CONTAINS);
                }
                }
                break;
            }
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
        this.enterRule(localContext, 148, CypherParser.RULE_oC_ListPredicateExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1398;
            this.match(CypherParser.SP);
            this.state = 1399;
            this.match(CypherParser.IN);
            this.state = 1401;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1400;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1403;
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
        this.enterRule(localContext, 150, CypherParser.RULE_oC_NullPredicateExpression);
        try {
            this.state = 1415;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 237, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1405;
                this.match(CypherParser.SP);
                this.state = 1406;
                this.match(CypherParser.IS);
                this.state = 1407;
                this.match(CypherParser.SP);
                this.state = 1408;
                this.match(CypherParser.NULL);
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1409;
                this.match(CypherParser.SP);
                this.state = 1410;
                this.match(CypherParser.IS);
                this.state = 1411;
                this.match(CypherParser.SP);
                this.state = 1412;
                this.match(CypherParser.NOT);
                this.state = 1413;
                this.match(CypherParser.SP);
                this.state = 1414;
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
        this.enterRule(localContext, 152, CypherParser.RULE_oC_AddOrSubtractExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1417;
            this.oC_MultiplyDivideModuloExpression();
            this.state = 1436;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 243, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    this.state = 1434;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 242, this.context) ) {
                    case 1:
                        {
                        {
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
                        this.match(CypherParser.T__19);
                        this.state = 1423;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1422;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1425;
                        this.oC_MultiplyDivideModuloExpression();
                        }
                        }
                        break;
                    case 2:
                        {
                        {
                        this.state = 1427;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1426;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1429;
                        this.match(CypherParser.T__20);
                        this.state = 1431;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1430;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1433;
                        this.oC_MultiplyDivideModuloExpression();
                        }
                        }
                        break;
                    }
                    }
                }
                this.state = 1438;
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
    public oC_MultiplyDivideModuloExpression(): OC_MultiplyDivideModuloExpressionContext {
        let localContext = new OC_MultiplyDivideModuloExpressionContext(this.context, this.state);
        this.enterRule(localContext, 154, CypherParser.RULE_oC_MultiplyDivideModuloExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1439;
            this.oC_PowerOfExpression();
            this.state = 1466;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 251, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    this.state = 1464;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 250, this.context) ) {
                    case 1:
                        {
                        {
                        this.state = 1441;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1440;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1443;
                        this.match(CypherParser.T__10);
                        this.state = 1445;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1444;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1447;
                        this.oC_PowerOfExpression();
                        }
                        }
                        break;
                    case 2:
                        {
                        {
                        this.state = 1449;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1448;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1451;
                        this.match(CypherParser.T__21);
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
                        this.oC_PowerOfExpression();
                        }
                        }
                        break;
                    case 3:
                        {
                        {
                        this.state = 1457;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1456;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1459;
                        this.match(CypherParser.T__22);
                        this.state = 1461;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1460;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1463;
                        this.oC_PowerOfExpression();
                        }
                        }
                        break;
                    }
                    }
                }
                this.state = 1468;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 251, this.context);
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
        this.enterRule(localContext, 156, CypherParser.RULE_oC_PowerOfExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1469;
            this.oC_UnaryAddOrSubtractExpression();
            this.state = 1480;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 254, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
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
                    this.match(CypherParser.T__23);
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
                    this.oC_UnaryAddOrSubtractExpression();
                    }
                    }
                }
                this.state = 1482;
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
    public oC_UnaryAddOrSubtractExpression(): OC_UnaryAddOrSubtractExpressionContext {
        let localContext = new OC_UnaryAddOrSubtractExpressionContext(this.context, this.state);
        this.enterRule(localContext, 158, CypherParser.RULE_oC_UnaryAddOrSubtractExpression);
        let _la: number;
        try {
            this.state = 1489;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.T__3:
            case CypherParser.T__7:
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
            case CypherParser.CYPHER:
            case CypherParser.UnescapedSymbolicName:
            case CypherParser.EscapedSymbolicName:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1483;
                this.oC_NonArithmeticOperatorExpression();
                }
                break;
            case CypherParser.T__19:
            case CypherParser.T__20:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1484;
                _la = this.tokenStream.LA(1);
                if(!(_la === 20 || _la === 21)) {
                this.errorHandler.recoverInline(this);
                }
                else {
                    this.errorHandler.reportMatch(this);
                    this.consume();
                }
                this.state = 1486;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1485;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1488;
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
        this.enterRule(localContext, 160, CypherParser.RULE_oC_NonArithmeticOperatorExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1491;
            this.oC_Atom();
            this.state = 1502;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 260, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    this.state = 1500;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 259, this.context) ) {
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
                        this.oC_ListOperatorExpression();
                        }
                        }
                        break;
                    case 2:
                        {
                        {
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
                        this.oC_PropertyLookup();
                        }
                        }
                        break;
                    }
                    }
                }
                this.state = 1504;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 260, this.context);
            }
            this.state = 1509;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 262, this.context) ) {
            case 1:
                {
                this.state = 1506;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1505;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1508;
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
        this.enterRule(localContext, 162, CypherParser.RULE_oC_ListOperatorExpression);
        let _la: number;
        try {
            this.state = 1524;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 265, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1511;
                this.match(CypherParser.T__11);
                this.state = 1512;
                this.oC_Expression();
                this.state = 1513;
                this.match(CypherParser.T__12);
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1515;
                this.match(CypherParser.T__11);
                this.state = 1517;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 70258960) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 8392671) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 536623139) !== 0) || ((((_la - 119)) & ~0x1F) === 0 && ((1 << (_la - 119)) & 1302535) !== 0)) {
                    {
                    this.state = 1516;
                    this.oC_Expression();
                    }
                }

                this.state = 1519;
                this.match(CypherParser.T__13);
                this.state = 1521;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 70258960) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 8392671) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 536623139) !== 0) || ((((_la - 119)) & ~0x1F) === 0 && ((1 << (_la - 119)) & 1302535) !== 0)) {
                    {
                    this.state = 1520;
                    this.oC_Expression();
                    }
                }

                this.state = 1523;
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
        this.enterRule(localContext, 164, CypherParser.RULE_oC_PropertyLookup);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1526;
            this.match(CypherParser.T__24);
            this.state = 1528;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1527;
                this.match(CypherParser.SP);
                }
            }

            {
            this.state = 1530;
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
        this.enterRule(localContext, 166, CypherParser.RULE_oC_Atom);
        let _la: number;
        try {
            this.state = 1558;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 270, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1532;
                this.oC_Literal();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1533;
                this.oC_Parameter();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1534;
                this.oC_CaseExpression();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 1535;
                this.match(CypherParser.COUNT);
                this.state = 1537;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1536;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1539;
                this.match(CypherParser.T__3);
                this.state = 1541;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1540;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1543;
                this.match(CypherParser.T__10);
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
                this.match(CypherParser.T__5);
                }
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 1548;
                this.oC_ListComprehension();
                }
                break;
            case 6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 1549;
                this.oC_PatternComprehension();
                }
                break;
            case 7:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 1550;
                this.oC_ReduceExpression();
                }
                break;
            case 8:
                this.enterOuterAlt(localContext, 8);
                {
                this.state = 1551;
                this.oC_ShortestPathPattern();
                }
                break;
            case 9:
                this.enterOuterAlt(localContext, 9);
                {
                this.state = 1552;
                this.oC_Quantifier();
                }
                break;
            case 10:
                this.enterOuterAlt(localContext, 10);
                {
                this.state = 1553;
                this.oC_PatternPredicate();
                }
                break;
            case 11:
                this.enterOuterAlt(localContext, 11);
                {
                this.state = 1554;
                this.oC_ParenthesizedExpression();
                }
                break;
            case 12:
                this.enterOuterAlt(localContext, 12);
                {
                this.state = 1555;
                this.oC_FunctionInvocation();
                }
                break;
            case 13:
                this.enterOuterAlt(localContext, 13);
                {
                this.state = 1556;
                this.oC_ExistentialSubquery();
                }
                break;
            case 14:
                this.enterOuterAlt(localContext, 14);
                {
                this.state = 1557;
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
        this.enterRule(localContext, 168, CypherParser.RULE_oC_CaseExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1582;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 276, this.context) ) {
            case 1:
                {
                {
                this.state = 1560;
                this.match(CypherParser.CASE);
                this.state = 1565;
                this.errorHandler.sync(this);
                alternative = 1;
                do {
                    switch (alternative) {
                    case 1:
                        {
                        {
                        this.state = 1562;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1561;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1564;
                        this.oC_CaseAlternative();
                        }
                        }
                        break;
                    default:
                        throw new antlr.NoViableAltException(this);
                    }
                    this.state = 1567;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 272, this.context);
                } while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER);
                }
                }
                break;
            case 2:
                {
                {
                this.state = 1569;
                this.match(CypherParser.CASE);
                this.state = 1571;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1570;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1573;
                this.oC_Expression();
                this.state = 1578;
                this.errorHandler.sync(this);
                alternative = 1;
                do {
                    switch (alternative) {
                    case 1:
                        {
                        {
                        this.state = 1575;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 140) {
                            {
                            this.state = 1574;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1577;
                        this.oC_CaseAlternative();
                        }
                        }
                        break;
                    default:
                        throw new antlr.NoViableAltException(this);
                    }
                    this.state = 1580;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 275, this.context);
                } while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER);
                }
                }
                break;
            }
            this.state = 1592;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 279, this.context) ) {
            case 1:
                {
                this.state = 1585;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1584;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1587;
                this.match(CypherParser.ELSE);
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
                this.oC_Expression();
                }
                break;
            }
            this.state = 1595;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1594;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1597;
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
        this.enterRule(localContext, 170, CypherParser.RULE_oC_CaseAlternative);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1599;
            this.match(CypherParser.WHEN);
            this.state = 1601;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1600;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1603;
            this.oC_Expression();
            this.state = 1605;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1604;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1607;
            this.match(CypherParser.THEN);
            this.state = 1609;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1608;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1611;
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
        this.enterRule(localContext, 172, CypherParser.RULE_oC_ListComprehension);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1613;
            this.match(CypherParser.T__11);
            this.state = 1615;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1614;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1617;
            this.oC_FilterExpression();
            this.state = 1626;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 287, this.context) ) {
            case 1:
                {
                this.state = 1619;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1618;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1621;
                this.match(CypherParser.T__6);
                this.state = 1623;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1622;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1625;
                this.oC_Expression();
                }
                break;
            }
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
        this.enterRule(localContext, 174, CypherParser.RULE_oC_PatternComprehension);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1633;
            this.match(CypherParser.T__11);
            this.state = 1635;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1634;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1645;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 8392607) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 272371715) !== 0) || ((((_la - 132)) & ~0x1F) === 0 && ((1 << (_la - 132)) & 159) !== 0)) {
                {
                this.state = 1637;
                this.oC_Variable();
                this.state = 1639;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1638;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1641;
                this.match(CypherParser.T__1);
                this.state = 1643;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1642;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1647;
            this.oC_RelationshipsPattern();
            this.state = 1649;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1648;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1655;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 83) {
                {
                this.state = 1651;
                this.oC_Where();
                this.state = 1653;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1652;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1657;
            this.match(CypherParser.T__6);
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
        this.enterRule(localContext, 176, CypherParser.RULE_oC_Quantifier);
        let _la: number;
        try {
            this.state = 1723;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.ALL:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1667;
                this.match(CypherParser.ALL);
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
                this.match(CypherParser.T__3);
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
                this.match(CypherParser.T__5);
                }
                }
                break;
            case CypherParser.ANY:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1681;
                this.match(CypherParser.ANY);
                this.state = 1683;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1682;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1685;
                this.match(CypherParser.T__3);
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
                this.oC_FilterExpression();
                this.state = 1691;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1690;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1693;
                this.match(CypherParser.T__5);
                }
                }
                break;
            case CypherParser.NONE:
                this.enterOuterAlt(localContext, 3);
                {
                {
                this.state = 1695;
                this.match(CypherParser.NONE);
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
                this.match(CypherParser.T__3);
                this.state = 1701;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1700;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1703;
                this.oC_FilterExpression();
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
                this.match(CypherParser.T__5);
                }
                }
                break;
            case CypherParser.SINGLE:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 1709;
                this.match(CypherParser.SINGLE);
                this.state = 1711;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1710;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1713;
                this.match(CypherParser.T__3);
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
                this.oC_FilterExpression();
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
        this.enterRule(localContext, 178, CypherParser.RULE_oC_FilterExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1725;
            this.oC_IdInColl();
            this.state = 1730;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 312, this.context) ) {
            case 1:
                {
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
        this.enterRule(localContext, 180, CypherParser.RULE_oC_PatternPredicate);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1732;
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
        this.enterRule(localContext, 182, CypherParser.RULE_oC_ParenthesizedExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1734;
            this.match(CypherParser.T__3);
            this.state = 1736;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1735;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1738;
            this.oC_Expression();
            this.state = 1740;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1739;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1742;
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
        this.enterRule(localContext, 184, CypherParser.RULE_oC_IdInColl);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1744;
            this.oC_Variable();
            this.state = 1745;
            this.match(CypherParser.SP);
            this.state = 1746;
            this.match(CypherParser.IN);
            this.state = 1747;
            this.match(CypherParser.SP);
            this.state = 1748;
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
        this.enterRule(localContext, 186, CypherParser.RULE_oC_ReduceExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1750;
            this.match(CypherParser.REDUCE);
            this.state = 1752;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1751;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1754;
            this.match(CypherParser.T__3);
            this.state = 1756;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1755;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1758;
            this.oC_Variable();
            this.state = 1760;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1759;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1762;
            this.match(CypherParser.T__1);
            this.state = 1764;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1763;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1766;
            this.oC_Expression();
            this.state = 1768;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1767;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1770;
            this.match(CypherParser.T__4);
            this.state = 1772;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1771;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1774;
            this.oC_IdInColl();
            this.state = 1776;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1775;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1778;
            this.match(CypherParser.T__6);
            this.state = 1780;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1779;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1782;
            this.oC_Expression();
            this.state = 1784;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1783;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1786;
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
        this.enterRule(localContext, 188, CypherParser.RULE_oC_FunctionInvocation);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1788;
            this.oC_FunctionName();
            this.state = 1790;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1789;
                this.match(CypherParser.SP);
                }
            }

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

            this.state = 1800;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 74) {
                {
                this.state = 1796;
                this.match(CypherParser.DISTINCT);
                this.state = 1798;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1797;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1819;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 70258960) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 8392671) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 536623139) !== 0) || ((((_la - 119)) & ~0x1F) === 0 && ((1 << (_la - 119)) & 1302535) !== 0)) {
                {
                this.state = 1802;
                this.oC_Expression();
                this.state = 1804;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1803;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1816;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 5) {
                    {
                    {
                    this.state = 1806;
                    this.match(CypherParser.T__4);
                    this.state = 1808;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
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
                    if (_la === 140) {
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
        this.enterRule(localContext, 190, CypherParser.RULE_oC_FunctionName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1823;
            this.oC_Namespace();
            this.state = 1824;
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
        this.enterRule(localContext, 192, CypherParser.RULE_oC_ExistentialSubquery);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1826;
            this.match(CypherParser.EXISTS);
            this.state = 1828;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1827;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1830;
            this.match(CypherParser.T__7);
            this.state = 1832;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1831;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1850;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 339, this.context) ) {
            case 1:
                {
                this.state = 1834;
                this.oC_RegularQuery();
                }
                break;
            case 2:
                {
                {
                this.state = 1839;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                do {
                    {
                    {
                    this.state = 1835;
                    this.oC_ReadingClause();
                    this.state = 1837;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 335, this.context) ) {
                    case 1:
                        {
                        this.state = 1836;
                        this.match(CypherParser.SP);
                        }
                        break;
                    }
                    }
                    }
                    this.state = 1841;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                } while (((((_la - 53)) & ~0x1F) === 0 && ((1 << (_la - 53)) & 131521) !== 0));
                }
                }
                break;
            case 3:
                {
                {
                this.state = 1843;
                this.oC_Pattern();
                this.state = 1848;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 338, this.context) ) {
                case 1:
                    {
                    this.state = 1845;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1844;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1847;
                    this.oC_Where();
                    }
                    break;
                }
                }
                }
                break;
            }
            this.state = 1853;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1852;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1855;
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
        this.enterRule(localContext, 194, CypherParser.RULE_oC_ExplicitProcedureInvocation);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1857;
            this.oC_ProcedureName();
            this.state = 1859;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1858;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1861;
            this.match(CypherParser.T__3);
            this.state = 1863;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1862;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1882;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 70258960) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 8392671) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 536623139) !== 0) || ((((_la - 119)) & ~0x1F) === 0 && ((1 << (_la - 119)) & 1302535) !== 0)) {
                {
                this.state = 1865;
                this.oC_Expression();
                this.state = 1867;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1866;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1879;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 5) {
                    {
                    {
                    this.state = 1869;
                    this.match(CypherParser.T__4);
                    this.state = 1871;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1870;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1873;
                    this.oC_Expression();
                    this.state = 1875;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1874;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 1881;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            this.state = 1884;
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
        this.enterRule(localContext, 196, CypherParser.RULE_oC_ImplicitProcedureInvocation);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1886;
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
        this.enterRule(localContext, 198, CypherParser.RULE_oC_ProcedureResultField);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1888;
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
        this.enterRule(localContext, 200, CypherParser.RULE_oC_ProcedureName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1890;
            this.oC_Namespace();
            this.state = 1891;
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
        this.enterRule(localContext, 202, CypherParser.RULE_oC_Namespace);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1898;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 348, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1893;
                    this.oC_SymbolicName();
                    this.state = 1894;
                    this.match(CypherParser.T__24);
                    }
                    }
                }
                this.state = 1900;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 348, this.context);
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
        this.enterRule(localContext, 204, CypherParser.RULE_oC_Variable);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1901;
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
        this.enterRule(localContext, 206, CypherParser.RULE_oC_Literal);
        try {
            this.state = 1909;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.TRUE:
            case CypherParser.FALSE:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1903;
                this.oC_BooleanLiteral();
                }
                break;
            case CypherParser.NULL:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1904;
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
                this.state = 1905;
                this.oC_NumberLiteral();
                }
                break;
            case CypherParser.StringLiteral:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 1906;
                this.match(CypherParser.StringLiteral);
                }
                break;
            case CypherParser.T__11:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 1907;
                this.oC_ListLiteral();
                }
                break;
            case CypherParser.T__7:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 1908;
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
        this.enterRule(localContext, 208, CypherParser.RULE_oC_BooleanLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1911;
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
        this.enterRule(localContext, 210, CypherParser.RULE_oC_NumberLiteral);
        try {
            this.state = 1915;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.ExponentDecimalReal:
            case CypherParser.RegularDecimalReal:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1913;
                this.oC_DoubleLiteral();
                }
                break;
            case CypherParser.HexInteger:
            case CypherParser.DecimalInteger:
            case CypherParser.OctalInteger:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1914;
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
        this.enterRule(localContext, 212, CypherParser.RULE_oC_IntegerLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1917;
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
        this.enterRule(localContext, 214, CypherParser.RULE_oC_DoubleLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1919;
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
        this.enterRule(localContext, 216, CypherParser.RULE_oC_ListLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1921;
            this.match(CypherParser.T__11);
            this.state = 1923;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1922;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1942;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 70258960) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 8392671) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 536623139) !== 0) || ((((_la - 119)) & ~0x1F) === 0 && ((1 << (_la - 119)) & 1302535) !== 0)) {
                {
                this.state = 1925;
                this.oC_Expression();
                this.state = 1927;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1926;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1939;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 5) {
                    {
                    {
                    this.state = 1929;
                    this.match(CypherParser.T__4);
                    this.state = 1931;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1930;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1933;
                    this.oC_Expression();
                    this.state = 1935;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1934;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 1941;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            this.state = 1944;
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
        this.enterRule(localContext, 218, CypherParser.RULE_oC_MapLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1946;
            this.match(CypherParser.T__7);
            this.state = 1948;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 140) {
                {
                this.state = 1947;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1983;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 4244635647) !== 0) || ((((_la - 78)) & ~0x1F) === 0 && ((1 << (_la - 78)) & 2147483647) !== 0) || ((((_la - 112)) & ~0x1F) === 0 && ((1 << (_la - 112)) & 167770113) !== 0)) {
                {
                this.state = 1950;
                this.oC_PropertyKeyName();
                this.state = 1952;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1951;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1954;
                this.match(CypherParser.T__2);
                this.state = 1956;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1955;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1958;
                this.oC_Expression();
                this.state = 1960;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 140) {
                    {
                    this.state = 1959;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1980;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 5) {
                    {
                    {
                    this.state = 1962;
                    this.match(CypherParser.T__4);
                    this.state = 1964;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1963;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1966;
                    this.oC_PropertyKeyName();
                    this.state = 1968;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1967;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1970;
                    this.match(CypherParser.T__2);
                    this.state = 1972;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1971;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1974;
                    this.oC_Expression();
                    this.state = 1976;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 140) {
                        {
                        this.state = 1975;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 1982;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            this.state = 1985;
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
        this.enterRule(localContext, 220, CypherParser.RULE_oC_PropertyKeyName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1987;
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
        this.enterRule(localContext, 222, CypherParser.RULE_oC_Parameter);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1989;
            this.match(CypherParser.T__25);
            this.state = 1992;
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
            case CypherParser.CYPHER:
            case CypherParser.UnescapedSymbolicName:
            case CypherParser.EscapedSymbolicName:
                {
                this.state = 1990;
                this.oC_SymbolicName();
                }
                break;
            case CypherParser.DecimalInteger:
                {
                this.state = 1991;
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
        this.enterRule(localContext, 224, CypherParser.RULE_oC_SchemaName);
        try {
            this.state = 1996;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 368, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1994;
                this.oC_SymbolicName();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1995;
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
        this.enterRule(localContext, 226, CypherParser.RULE_oC_ReservedWord);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1998;
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
        this.enterRule(localContext, 228, CypherParser.RULE_oC_SymbolicName);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 2000;
            _la = this.tokenStream.LA(1);
            if(!(((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 8392607) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 272371715) !== 0) || ((((_la - 132)) & ~0x1F) === 0 && ((1 << (_la - 132)) & 159) !== 0))) {
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
        this.enterRule(localContext, 230, CypherParser.RULE_oC_LeftArrowHead);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 2002;
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
        this.enterRule(localContext, 232, CypherParser.RULE_oC_RightArrowHead);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 2004;
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
        this.enterRule(localContext, 234, CypherParser.RULE_oC_Dash);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 2006;
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
        4,1,142,2009,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,
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
        2,115,7,115,2,116,7,116,2,117,7,117,1,0,3,0,238,8,0,1,0,1,0,1,0,
        5,0,243,8,0,10,0,12,0,246,9,0,1,0,3,0,249,8,0,5,0,251,8,0,10,0,12,
        0,254,9,0,1,0,1,0,3,0,258,8,0,1,0,3,0,261,8,0,1,0,3,0,264,8,0,1,
        0,1,0,1,1,1,1,3,1,270,8,1,1,1,1,1,3,1,274,8,1,1,1,1,1,1,2,1,2,1,
        3,1,3,1,3,3,3,283,8,3,1,4,1,4,1,4,1,4,3,4,289,8,4,1,5,1,5,1,5,1,
        5,1,5,1,5,3,5,297,8,5,1,5,1,5,3,5,301,8,5,1,5,1,5,3,5,305,8,5,1,
        5,1,5,3,5,309,8,5,1,5,1,5,3,5,313,8,5,1,5,1,5,3,5,317,8,5,1,5,3,
        5,320,8,5,1,5,1,5,1,5,1,5,3,5,326,8,5,1,5,1,5,3,5,330,8,5,1,5,1,
        5,3,5,334,8,5,1,5,1,5,3,5,338,8,5,1,5,1,5,1,5,1,5,1,5,1,5,3,5,346,
        8,5,1,5,1,5,3,5,350,8,5,1,5,1,5,3,5,354,8,5,1,5,1,5,3,5,358,8,5,
        1,5,1,5,3,5,362,8,5,1,6,1,6,1,6,1,6,1,6,1,6,3,6,370,8,6,1,6,1,6,
        3,6,374,8,6,1,6,1,6,3,6,378,8,6,1,6,1,6,3,6,382,8,6,1,6,1,6,1,6,
        1,6,1,6,1,6,3,6,390,8,6,1,6,1,6,3,6,394,8,6,1,6,1,6,3,6,398,8,6,
        1,6,1,6,3,6,402,8,6,1,6,1,6,1,6,1,6,1,6,1,6,3,6,410,8,6,1,6,1,6,
        3,6,414,8,6,1,6,1,6,3,6,418,8,6,1,6,1,6,3,6,422,8,6,1,6,1,6,3,6,
        426,8,6,1,7,1,7,1,8,1,8,3,8,432,8,8,1,9,1,9,3,9,436,8,9,1,9,1,9,
        3,9,440,8,9,1,9,1,9,3,9,444,8,9,1,9,5,9,447,8,9,10,9,12,9,450,9,
        9,1,9,3,9,453,8,9,1,9,1,9,1,10,1,10,1,10,1,10,1,10,1,10,3,10,463,
        8,10,1,10,1,10,1,10,1,10,1,10,1,10,3,10,471,8,10,1,10,1,10,3,10,
        475,8,10,1,10,5,10,478,8,10,10,10,12,10,481,9,10,1,10,1,10,3,10,
        485,8,10,1,11,1,11,1,11,1,11,1,11,1,11,3,11,493,8,11,1,11,1,11,1,
        11,1,11,1,11,1,11,3,11,501,8,11,1,11,1,11,3,11,505,8,11,1,11,5,11,
        508,8,11,10,11,12,11,511,9,11,1,11,1,11,3,11,515,8,11,1,12,1,12,
        1,12,1,12,1,12,1,12,1,12,1,12,3,12,525,8,12,1,13,1,13,3,13,529,8,
        13,1,13,5,13,532,8,13,10,13,12,13,535,9,13,1,14,1,14,1,14,1,14,3,
        14,541,8,14,1,14,1,14,1,14,3,14,546,8,14,1,14,3,14,549,8,14,1,15,
        1,15,3,15,553,8,15,1,16,1,16,3,16,557,8,16,5,16,559,8,16,10,16,12,
        16,562,9,16,1,16,1,16,1,16,3,16,567,8,16,5,16,569,8,16,10,16,12,
        16,572,9,16,1,16,1,16,3,16,576,8,16,1,16,5,16,579,8,16,10,16,12,
        16,582,9,16,1,16,3,16,585,8,16,1,16,3,16,588,8,16,3,16,590,8,16,
        1,17,1,17,3,17,594,8,17,5,17,596,8,17,10,17,12,17,599,9,17,1,17,
        1,17,3,17,603,8,17,5,17,605,8,17,10,17,12,17,608,9,17,1,17,1,17,
        3,17,612,8,17,4,17,614,8,17,11,17,12,17,615,1,17,1,17,1,18,1,18,
        1,18,1,18,1,18,1,18,1,18,3,18,627,8,18,1,19,1,19,1,19,1,19,1,19,
        3,19,634,8,19,1,20,1,20,1,20,1,20,1,20,1,20,1,20,3,20,643,8,20,1,
        20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,3,20,657,
        8,20,1,21,1,21,3,21,661,8,21,1,21,1,21,3,21,665,8,21,1,21,1,21,1,
        21,1,21,1,21,1,21,3,21,673,8,21,1,21,1,21,3,21,677,8,21,1,21,4,21,
        680,8,21,11,21,12,21,681,1,21,3,21,685,8,21,1,21,1,21,1,22,1,22,
        3,22,691,8,22,1,22,1,22,3,22,695,8,22,1,22,1,22,3,22,699,8,22,1,
        22,1,22,1,23,1,23,3,23,705,8,23,1,23,1,23,3,23,709,8,23,1,23,1,23,
        3,23,713,8,23,1,23,3,23,716,8,23,1,24,1,24,3,24,720,8,24,1,24,1,
        24,1,24,1,24,1,24,1,24,1,25,1,25,3,25,730,8,25,1,25,1,25,1,25,5,
        25,735,8,25,10,25,12,25,738,9,25,1,26,1,26,1,26,1,26,1,26,1,26,1,
        26,1,26,1,26,1,26,3,26,750,8,26,1,27,1,27,3,27,754,8,27,1,27,1,27,
        1,28,1,28,3,28,760,8,28,1,28,1,28,3,28,764,8,28,1,28,1,28,3,28,768,
        8,28,1,28,5,28,771,8,28,10,28,12,28,774,9,28,1,29,1,29,3,29,778,
        8,29,1,29,1,29,3,29,782,8,29,1,29,1,29,1,29,1,29,3,29,788,8,29,1,
        29,1,29,3,29,792,8,29,1,29,1,29,1,29,1,29,3,29,798,8,29,1,29,1,29,
        3,29,802,8,29,1,29,1,29,1,29,1,29,3,29,808,8,29,1,29,1,29,3,29,812,
        8,29,1,30,1,30,3,30,816,8,30,1,30,1,30,3,30,820,8,30,1,30,1,30,3,
        30,824,8,30,1,30,1,30,3,30,828,8,30,1,30,5,30,831,8,30,10,30,12,
        30,834,9,30,1,31,1,31,1,31,1,31,3,31,840,8,31,1,31,1,31,3,31,844,
        8,31,1,31,5,31,847,8,31,10,31,12,31,850,9,31,1,32,1,32,1,32,1,32,
        3,32,856,8,32,1,33,1,33,1,33,1,33,3,33,862,8,33,1,33,1,33,1,33,3,
        33,867,8,33,1,34,1,34,1,34,1,34,3,34,873,8,34,1,34,3,34,876,8,34,
        1,34,1,34,1,34,1,34,3,34,882,8,34,3,34,884,8,34,1,35,1,35,3,35,888,
        8,35,1,35,1,35,3,35,892,8,35,1,35,5,35,895,8,35,10,35,12,35,898,
        9,35,1,35,3,35,901,8,35,1,35,3,35,904,8,35,1,36,1,36,1,36,1,36,1,
        36,3,36,911,8,36,1,36,1,36,1,37,1,37,1,37,3,37,918,8,37,1,37,3,37,
        921,8,37,1,38,1,38,1,38,1,39,3,39,927,8,39,1,39,3,39,930,8,39,1,
        39,1,39,1,39,1,39,3,39,936,8,39,1,39,1,39,3,39,940,8,39,1,39,1,39,
        3,39,944,8,39,1,40,1,40,3,40,948,8,40,1,40,1,40,3,40,952,8,40,1,
        40,5,40,955,8,40,10,40,12,40,958,9,40,1,40,1,40,3,40,962,8,40,1,
        40,1,40,3,40,966,8,40,1,40,5,40,969,8,40,10,40,12,40,972,9,40,3,
        40,974,8,40,1,41,1,41,1,41,1,41,1,41,1,41,1,41,3,41,983,8,41,1,42,
        1,42,1,42,1,42,1,42,1,42,1,42,3,42,992,8,42,1,42,5,42,995,8,42,10,
        42,12,42,998,9,42,1,43,1,43,1,43,1,43,1,44,1,44,1,44,1,44,1,45,1,
        45,3,45,1010,8,45,1,45,3,45,1013,8,45,1,46,1,46,1,46,1,46,1,47,1,
        47,3,47,1021,8,47,1,47,1,47,3,47,1025,8,47,1,47,5,47,1028,8,47,10,
        47,12,47,1031,9,47,1,48,1,48,3,48,1035,8,48,1,48,1,48,3,48,1039,
        8,48,1,48,1,48,1,48,3,48,1044,8,48,1,49,1,49,3,49,1048,8,49,1,50,
        1,50,3,50,1052,8,50,1,50,1,50,3,50,1056,8,50,1,50,1,50,3,50,1060,
        8,50,1,50,1,50,1,51,1,51,3,51,1066,8,51,1,51,5,51,1069,8,51,10,51,
        12,51,1072,9,51,1,51,1,51,1,51,1,51,3,51,1078,8,51,1,52,1,52,3,52,
        1082,8,52,1,52,4,52,1085,8,52,11,52,12,52,1086,1,53,1,53,3,53,1091,
        8,53,1,53,1,53,3,53,1095,8,53,3,53,1097,8,53,1,53,1,53,3,53,1101,
        8,53,3,53,1103,8,53,1,53,1,53,3,53,1107,8,53,3,53,1109,8,53,1,53,
        1,53,1,54,1,54,3,54,1115,8,54,1,54,1,54,1,55,1,55,3,55,1121,8,55,
        1,55,1,55,3,55,1125,8,55,1,55,3,55,1128,8,55,1,55,3,55,1131,8,55,
        1,55,1,55,3,55,1135,8,55,1,55,1,55,1,55,1,55,3,55,1141,8,55,1,55,
        1,55,3,55,1145,8,55,1,55,3,55,1148,8,55,1,55,3,55,1151,8,55,1,55,
        1,55,1,55,1,55,3,55,1157,8,55,1,55,3,55,1160,8,55,1,55,3,55,1163,
        8,55,1,55,1,55,3,55,1167,8,55,1,55,1,55,1,55,1,55,3,55,1173,8,55,
        1,55,3,55,1176,8,55,1,55,3,55,1179,8,55,1,55,1,55,3,55,1183,8,55,
        1,56,1,56,3,56,1187,8,56,1,56,1,56,3,56,1191,8,56,3,56,1193,8,56,
        1,56,1,56,3,56,1197,8,56,3,56,1199,8,56,1,56,3,56,1202,8,56,1,56,
        1,56,3,56,1206,8,56,3,56,1208,8,56,1,56,1,56,1,57,1,57,3,57,1214,
        8,57,1,58,1,58,3,58,1218,8,58,1,58,1,58,3,58,1222,8,58,1,58,1,58,
        3,58,1226,8,58,1,58,3,58,1229,8,58,1,58,5,58,1232,8,58,10,58,12,
        58,1235,9,58,1,59,1,59,3,59,1239,8,59,1,59,5,59,1242,8,59,10,59,
        12,59,1245,9,59,1,60,1,60,3,60,1249,8,60,1,60,1,60,1,61,1,61,3,61,
        1255,8,61,1,61,1,61,3,61,1259,8,61,3,61,1261,8,61,1,61,1,61,3,61,
        1265,8,61,1,61,1,61,3,61,1269,8,61,3,61,1271,8,61,3,61,1273,8,61,
        1,62,1,62,1,63,1,63,1,64,1,64,3,64,1281,8,64,1,64,4,64,1284,8,64,
        11,64,12,64,1285,1,65,1,65,1,66,1,66,1,66,1,66,1,66,5,66,1295,8,
        66,10,66,12,66,1298,9,66,1,67,1,67,1,67,1,67,1,67,5,67,1305,8,67,
        10,67,12,67,1308,9,67,1,68,1,68,1,68,1,68,1,68,5,68,1315,8,68,10,
        68,12,68,1318,9,68,1,69,1,69,3,69,1322,8,69,5,69,1324,8,69,10,69,
        12,69,1327,9,69,1,69,1,69,1,70,1,70,3,70,1333,8,70,1,70,5,70,1336,
        8,70,10,70,12,70,1339,9,70,1,71,1,71,3,71,1343,8,71,1,71,1,71,1,
        71,3,71,1348,8,71,1,71,1,71,1,71,3,71,1353,8,71,1,71,1,71,1,71,3,
        71,1358,8,71,1,71,1,71,1,71,3,71,1363,8,71,1,71,1,71,1,71,3,71,1368,
        8,71,1,71,3,71,1371,8,71,1,72,1,72,1,72,1,72,5,72,1377,8,72,10,72,
        12,72,1380,9,72,1,73,1,73,1,73,1,73,1,73,1,73,1,73,1,73,1,73,1,73,
        3,73,1392,8,73,1,73,3,73,1395,8,73,1,73,1,73,1,74,1,74,1,74,3,74,
        1402,8,74,1,74,1,74,1,75,1,75,1,75,1,75,1,75,1,75,1,75,1,75,1,75,
        1,75,3,75,1416,8,75,1,76,1,76,3,76,1420,8,76,1,76,1,76,3,76,1424,
        8,76,1,76,1,76,3,76,1428,8,76,1,76,1,76,3,76,1432,8,76,1,76,5,76,
        1435,8,76,10,76,12,76,1438,9,76,1,77,1,77,3,77,1442,8,77,1,77,1,
        77,3,77,1446,8,77,1,77,1,77,3,77,1450,8,77,1,77,1,77,3,77,1454,8,
        77,1,77,1,77,3,77,1458,8,77,1,77,1,77,3,77,1462,8,77,1,77,5,77,1465,
        8,77,10,77,12,77,1468,9,77,1,78,1,78,3,78,1472,8,78,1,78,1,78,3,
        78,1476,8,78,1,78,5,78,1479,8,78,10,78,12,78,1482,9,78,1,79,1,79,
        1,79,3,79,1487,8,79,1,79,3,79,1490,8,79,1,80,1,80,3,80,1494,8,80,
        1,80,1,80,3,80,1498,8,80,1,80,5,80,1501,8,80,10,80,12,80,1504,9,
        80,1,80,3,80,1507,8,80,1,80,3,80,1510,8,80,1,81,1,81,1,81,1,81,1,
        81,1,81,3,81,1518,8,81,1,81,1,81,3,81,1522,8,81,1,81,3,81,1525,8,
        81,1,82,1,82,3,82,1529,8,82,1,82,1,82,1,83,1,83,1,83,1,83,1,83,3,
        83,1538,8,83,1,83,1,83,3,83,1542,8,83,1,83,1,83,3,83,1546,8,83,1,
        83,1,83,1,83,1,83,1,83,1,83,1,83,1,83,1,83,1,83,1,83,3,83,1559,8,
        83,1,84,1,84,3,84,1563,8,84,1,84,4,84,1566,8,84,11,84,12,84,1567,
        1,84,1,84,3,84,1572,8,84,1,84,1,84,3,84,1576,8,84,1,84,4,84,1579,
        8,84,11,84,12,84,1580,3,84,1583,8,84,1,84,3,84,1586,8,84,1,84,1,
        84,3,84,1590,8,84,1,84,3,84,1593,8,84,1,84,3,84,1596,8,84,1,84,1,
        84,1,85,1,85,3,85,1602,8,85,1,85,1,85,3,85,1606,8,85,1,85,1,85,3,
        85,1610,8,85,1,85,1,85,1,86,1,86,3,86,1616,8,86,1,86,1,86,3,86,1620,
        8,86,1,86,1,86,3,86,1624,8,86,1,86,3,86,1627,8,86,1,86,3,86,1630,
        8,86,1,86,1,86,1,87,1,87,3,87,1636,8,87,1,87,1,87,3,87,1640,8,87,
        1,87,1,87,3,87,1644,8,87,3,87,1646,8,87,1,87,1,87,3,87,1650,8,87,
        1,87,1,87,3,87,1654,8,87,3,87,1656,8,87,1,87,1,87,3,87,1660,8,87,
        1,87,1,87,3,87,1664,8,87,1,87,1,87,1,88,1,88,3,88,1670,8,88,1,88,
        1,88,3,88,1674,8,88,1,88,1,88,3,88,1678,8,88,1,88,1,88,1,88,1,88,
        3,88,1684,8,88,1,88,1,88,3,88,1688,8,88,1,88,1,88,3,88,1692,8,88,
        1,88,1,88,1,88,1,88,3,88,1698,8,88,1,88,1,88,3,88,1702,8,88,1,88,
        1,88,3,88,1706,8,88,1,88,1,88,1,88,1,88,3,88,1712,8,88,1,88,1,88,
        3,88,1716,8,88,1,88,1,88,3,88,1720,8,88,1,88,1,88,3,88,1724,8,88,
        1,89,1,89,3,89,1728,8,89,1,89,3,89,1731,8,89,1,90,1,90,1,91,1,91,
        3,91,1737,8,91,1,91,1,91,3,91,1741,8,91,1,91,1,91,1,92,1,92,1,92,
        1,92,1,92,1,92,1,93,1,93,3,93,1753,8,93,1,93,1,93,3,93,1757,8,93,
        1,93,1,93,3,93,1761,8,93,1,93,1,93,3,93,1765,8,93,1,93,1,93,3,93,
        1769,8,93,1,93,1,93,3,93,1773,8,93,1,93,1,93,3,93,1777,8,93,1,93,
        1,93,3,93,1781,8,93,1,93,1,93,3,93,1785,8,93,1,93,1,93,1,94,1,94,
        3,94,1791,8,94,1,94,1,94,3,94,1795,8,94,1,94,1,94,3,94,1799,8,94,
        3,94,1801,8,94,1,94,1,94,3,94,1805,8,94,1,94,1,94,3,94,1809,8,94,
        1,94,1,94,3,94,1813,8,94,5,94,1815,8,94,10,94,12,94,1818,9,94,3,
        94,1820,8,94,1,94,1,94,1,95,1,95,1,95,1,96,1,96,3,96,1829,8,96,1,
        96,1,96,3,96,1833,8,96,1,96,1,96,1,96,3,96,1838,8,96,4,96,1840,8,
        96,11,96,12,96,1841,1,96,1,96,3,96,1846,8,96,1,96,3,96,1849,8,96,
        3,96,1851,8,96,1,96,3,96,1854,8,96,1,96,1,96,1,97,1,97,3,97,1860,
        8,97,1,97,1,97,3,97,1864,8,97,1,97,1,97,3,97,1868,8,97,1,97,1,97,
        3,97,1872,8,97,1,97,1,97,3,97,1876,8,97,5,97,1878,8,97,10,97,12,
        97,1881,9,97,3,97,1883,8,97,1,97,1,97,1,98,1,98,1,99,1,99,1,100,
        1,100,1,100,1,101,1,101,1,101,5,101,1897,8,101,10,101,12,101,1900,
        9,101,1,102,1,102,1,103,1,103,1,103,1,103,1,103,1,103,3,103,1910,
        8,103,1,104,1,104,1,105,1,105,3,105,1916,8,105,1,106,1,106,1,107,
        1,107,1,108,1,108,3,108,1924,8,108,1,108,1,108,3,108,1928,8,108,
        1,108,1,108,3,108,1932,8,108,1,108,1,108,3,108,1936,8,108,5,108,
        1938,8,108,10,108,12,108,1941,9,108,3,108,1943,8,108,1,108,1,108,
        1,109,1,109,3,109,1949,8,109,1,109,1,109,3,109,1953,8,109,1,109,
        1,109,3,109,1957,8,109,1,109,1,109,3,109,1961,8,109,1,109,1,109,
        3,109,1965,8,109,1,109,1,109,3,109,1969,8,109,1,109,1,109,3,109,
        1973,8,109,1,109,1,109,3,109,1977,8,109,5,109,1979,8,109,10,109,
        12,109,1982,9,109,3,109,1984,8,109,1,109,1,109,1,110,1,110,1,111,
        1,111,1,111,3,111,1993,8,111,1,112,1,112,3,112,1997,8,112,1,113,
        1,113,1,114,1,114,1,115,1,115,1,116,1,116,1,117,1,117,1,117,0,0,
        118,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,
        44,46,48,50,52,54,56,58,60,62,64,66,68,70,72,74,76,78,80,82,84,86,
        88,90,92,94,96,98,100,102,104,106,108,110,112,114,116,118,120,122,
        124,126,128,130,132,134,136,138,140,142,144,146,148,150,152,154,
        156,158,160,162,164,166,168,170,172,174,176,178,180,182,184,186,
        188,190,192,194,196,198,200,202,204,206,208,210,212,214,216,218,
        220,222,224,226,228,230,232,234,0,12,1,0,48,49,1,0,79,82,1,0,84,
        85,1,0,20,21,1,0,107,108,1,0,109,111,1,0,119,120,7,0,51,52,58,69,
        72,83,86,95,97,101,106,108,123,132,9,0,46,50,53,57,69,69,84,85,96,
        96,102,105,112,112,132,136,139,139,2,0,16,16,27,30,2,0,17,17,31,
        34,2,0,21,21,35,45,2302,0,237,1,0,0,0,2,267,1,0,0,0,4,277,1,0,0,
        0,6,282,1,0,0,0,8,288,1,0,0,0,10,361,1,0,0,0,12,425,1,0,0,0,14,427,
        1,0,0,0,16,431,1,0,0,0,18,433,1,0,0,0,20,456,1,0,0,0,22,486,1,0,
        0,0,24,524,1,0,0,0,26,526,1,0,0,0,28,548,1,0,0,0,30,552,1,0,0,0,
        32,589,1,0,0,0,34,613,1,0,0,0,36,626,1,0,0,0,38,633,1,0,0,0,40,635,
        1,0,0,0,42,658,1,0,0,0,44,688,1,0,0,0,46,704,1,0,0,0,48,717,1,0,
        0,0,50,727,1,0,0,0,52,749,1,0,0,0,54,751,1,0,0,0,56,757,1,0,0,0,
        58,811,1,0,0,0,60,815,1,0,0,0,62,835,1,0,0,0,64,855,1,0,0,0,66,857,
        1,0,0,0,68,868,1,0,0,0,70,885,1,0,0,0,72,910,1,0,0,0,74,914,1,0,
        0,0,76,922,1,0,0,0,78,929,1,0,0,0,80,973,1,0,0,0,82,982,1,0,0,0,
        84,984,1,0,0,0,86,999,1,0,0,0,88,1003,1,0,0,0,90,1007,1,0,0,0,92,
        1014,1,0,0,0,94,1018,1,0,0,0,96,1043,1,0,0,0,98,1047,1,0,0,0,100,
        1049,1,0,0,0,102,1077,1,0,0,0,104,1079,1,0,0,0,106,1088,1,0,0,0,
        108,1112,1,0,0,0,110,1182,1,0,0,0,112,1184,1,0,0,0,114,1213,1,0,
        0,0,116,1215,1,0,0,0,118,1236,1,0,0,0,120,1246,1,0,0,0,122,1252,
        1,0,0,0,124,1274,1,0,0,0,126,1276,1,0,0,0,128,1278,1,0,0,0,130,1287,
        1,0,0,0,132,1289,1,0,0,0,134,1299,1,0,0,0,136,1309,1,0,0,0,138,1325,
        1,0,0,0,140,1330,1,0,0,0,142,1370,1,0,0,0,144,1372,1,0,0,0,146,1391,
        1,0,0,0,148,1398,1,0,0,0,150,1415,1,0,0,0,152,1417,1,0,0,0,154,1439,
        1,0,0,0,156,1469,1,0,0,0,158,1489,1,0,0,0,160,1491,1,0,0,0,162,1524,
        1,0,0,0,164,1526,1,0,0,0,166,1558,1,0,0,0,168,1582,1,0,0,0,170,1599,
        1,0,0,0,172,1613,1,0,0,0,174,1633,1,0,0,0,176,1723,1,0,0,0,178,1725,
        1,0,0,0,180,1732,1,0,0,0,182,1734,1,0,0,0,184,1744,1,0,0,0,186,1750,
        1,0,0,0,188,1788,1,0,0,0,190,1823,1,0,0,0,192,1826,1,0,0,0,194,1857,
        1,0,0,0,196,1886,1,0,0,0,198,1888,1,0,0,0,200,1890,1,0,0,0,202,1898,
        1,0,0,0,204,1901,1,0,0,0,206,1909,1,0,0,0,208,1911,1,0,0,0,210,1915,
        1,0,0,0,212,1917,1,0,0,0,214,1919,1,0,0,0,216,1921,1,0,0,0,218,1946,
        1,0,0,0,220,1987,1,0,0,0,222,1989,1,0,0,0,224,1996,1,0,0,0,226,1998,
        1,0,0,0,228,2000,1,0,0,0,230,2002,1,0,0,0,232,2004,1,0,0,0,234,2006,
        1,0,0,0,236,238,5,140,0,0,237,236,1,0,0,0,237,238,1,0,0,0,238,252,
        1,0,0,0,239,244,5,135,0,0,240,241,5,140,0,0,241,243,3,2,1,0,242,
        240,1,0,0,0,243,246,1,0,0,0,244,242,1,0,0,0,244,245,1,0,0,0,245,
        248,1,0,0,0,246,244,1,0,0,0,247,249,5,140,0,0,248,247,1,0,0,0,248,
        249,1,0,0,0,249,251,1,0,0,0,250,239,1,0,0,0,251,254,1,0,0,0,252,
        250,1,0,0,0,252,253,1,0,0,0,253,255,1,0,0,0,254,252,1,0,0,0,255,
        260,3,4,2,0,256,258,5,140,0,0,257,256,1,0,0,0,257,258,1,0,0,0,258,
        259,1,0,0,0,259,261,5,1,0,0,260,257,1,0,0,0,260,261,1,0,0,0,261,
        263,1,0,0,0,262,264,5,140,0,0,263,262,1,0,0,0,263,264,1,0,0,0,264,
        265,1,0,0,0,265,266,5,0,0,1,266,1,1,0,0,0,267,269,3,224,112,0,268,
        270,5,140,0,0,269,268,1,0,0,0,269,270,1,0,0,0,270,271,1,0,0,0,271,
        273,5,2,0,0,272,274,5,140,0,0,273,272,1,0,0,0,273,274,1,0,0,0,274,
        275,1,0,0,0,275,276,3,130,65,0,276,3,1,0,0,0,277,278,3,6,3,0,278,
        5,1,0,0,0,279,283,3,26,13,0,280,283,3,68,34,0,281,283,3,8,4,0,282,
        279,1,0,0,0,282,280,1,0,0,0,282,281,1,0,0,0,283,7,1,0,0,0,284,289,
        3,10,5,0,285,289,3,12,6,0,286,289,3,20,10,0,287,289,3,22,11,0,288,
        284,1,0,0,0,288,285,1,0,0,0,288,286,1,0,0,0,288,287,1,0,0,0,289,
        9,1,0,0,0,290,291,5,65,0,0,291,292,5,140,0,0,292,293,3,14,7,0,293,
        294,5,140,0,0,294,296,5,46,0,0,295,297,5,140,0,0,296,295,1,0,0,0,
        296,297,1,0,0,0,297,298,1,0,0,0,298,300,5,125,0,0,299,301,5,140,
        0,0,300,299,1,0,0,0,300,301,1,0,0,0,301,302,1,0,0,0,302,304,3,16,
        8,0,303,305,5,140,0,0,304,303,1,0,0,0,304,305,1,0,0,0,305,306,1,
        0,0,0,306,308,5,64,0,0,307,309,5,140,0,0,308,307,1,0,0,0,308,309,
        1,0,0,0,309,310,1,0,0,0,310,319,3,18,9,0,311,313,5,140,0,0,312,311,
        1,0,0,0,312,313,1,0,0,0,313,314,1,0,0,0,314,316,5,50,0,0,315,317,
        5,140,0,0,316,315,1,0,0,0,316,317,1,0,0,0,317,318,1,0,0,0,318,320,
        3,218,109,0,319,312,1,0,0,0,319,320,1,0,0,0,320,362,1,0,0,0,321,
        322,5,65,0,0,322,323,5,140,0,0,323,325,5,46,0,0,324,326,5,140,0,
        0,325,324,1,0,0,0,325,326,1,0,0,0,326,327,1,0,0,0,327,329,5,125,
        0,0,328,330,5,140,0,0,329,328,1,0,0,0,329,330,1,0,0,0,330,331,1,
        0,0,0,331,333,3,16,8,0,332,334,5,140,0,0,333,332,1,0,0,0,333,334,
        1,0,0,0,334,335,1,0,0,0,335,337,5,64,0,0,336,338,5,140,0,0,337,336,
        1,0,0,0,337,338,1,0,0,0,338,339,1,0,0,0,339,340,3,18,9,0,340,362,
        1,0,0,0,341,342,5,65,0,0,342,343,5,140,0,0,343,345,5,46,0,0,344,
        346,5,140,0,0,345,344,1,0,0,0,345,346,1,0,0,0,346,347,1,0,0,0,347,
        349,5,64,0,0,348,350,5,140,0,0,349,348,1,0,0,0,349,350,1,0,0,0,350,
        351,1,0,0,0,351,353,5,3,0,0,352,354,5,140,0,0,353,352,1,0,0,0,353,
        354,1,0,0,0,354,355,1,0,0,0,355,357,3,124,62,0,356,358,5,140,0,0,
        357,356,1,0,0,0,357,358,1,0,0,0,358,359,1,0,0,0,359,360,3,18,9,0,
        360,362,1,0,0,0,361,290,1,0,0,0,361,321,1,0,0,0,361,341,1,0,0,0,
        362,11,1,0,0,0,363,364,5,132,0,0,364,365,5,140,0,0,365,366,3,14,
        7,0,366,367,5,140,0,0,367,369,5,46,0,0,368,370,5,140,0,0,369,368,
        1,0,0,0,369,370,1,0,0,0,370,371,1,0,0,0,371,373,5,125,0,0,372,374,
        5,140,0,0,373,372,1,0,0,0,373,374,1,0,0,0,374,375,1,0,0,0,375,377,
        3,16,8,0,376,378,5,140,0,0,377,376,1,0,0,0,377,378,1,0,0,0,378,379,
        1,0,0,0,379,381,5,64,0,0,380,382,5,140,0,0,381,380,1,0,0,0,381,382,
        1,0,0,0,382,383,1,0,0,0,383,384,3,18,9,0,384,426,1,0,0,0,385,386,
        5,132,0,0,386,387,5,140,0,0,387,389,5,46,0,0,388,390,5,140,0,0,389,
        388,1,0,0,0,389,390,1,0,0,0,390,391,1,0,0,0,391,393,5,125,0,0,392,
        394,5,140,0,0,393,392,1,0,0,0,393,394,1,0,0,0,394,395,1,0,0,0,395,
        397,3,16,8,0,396,398,5,140,0,0,397,396,1,0,0,0,397,398,1,0,0,0,398,
        399,1,0,0,0,399,401,5,64,0,0,400,402,5,140,0,0,401,400,1,0,0,0,401,
        402,1,0,0,0,402,403,1,0,0,0,403,404,3,18,9,0,404,426,1,0,0,0,405,
        406,5,132,0,0,406,407,5,140,0,0,407,409,5,46,0,0,408,410,5,140,0,
        0,409,408,1,0,0,0,409,410,1,0,0,0,410,411,1,0,0,0,411,413,5,64,0,
        0,412,414,5,140,0,0,413,412,1,0,0,0,413,414,1,0,0,0,414,415,1,0,
        0,0,415,417,5,3,0,0,416,418,5,140,0,0,417,416,1,0,0,0,417,418,1,
        0,0,0,418,419,1,0,0,0,419,421,3,124,62,0,420,422,5,140,0,0,421,420,
        1,0,0,0,421,422,1,0,0,0,422,423,1,0,0,0,423,424,3,18,9,0,424,426,
        1,0,0,0,425,363,1,0,0,0,425,385,1,0,0,0,425,405,1,0,0,0,426,13,1,
        0,0,0,427,428,7,0,0,0,428,15,1,0,0,0,429,432,3,106,53,0,430,432,
        3,104,52,0,431,429,1,0,0,0,431,430,1,0,0,0,432,17,1,0,0,0,433,435,
        5,4,0,0,434,436,5,140,0,0,435,434,1,0,0,0,435,436,1,0,0,0,436,437,
        1,0,0,0,437,448,3,130,65,0,438,440,5,140,0,0,439,438,1,0,0,0,439,
        440,1,0,0,0,440,441,1,0,0,0,441,443,5,5,0,0,442,444,5,140,0,0,443,
        442,1,0,0,0,443,444,1,0,0,0,444,445,1,0,0,0,445,447,3,130,65,0,446,
        439,1,0,0,0,447,450,1,0,0,0,448,446,1,0,0,0,448,449,1,0,0,0,449,
        452,1,0,0,0,450,448,1,0,0,0,451,453,5,140,0,0,452,451,1,0,0,0,452,
        453,1,0,0,0,453,454,1,0,0,0,454,455,5,6,0,0,455,19,1,0,0,0,456,457,
        5,65,0,0,457,458,5,140,0,0,458,459,5,123,0,0,459,460,5,140,0,0,460,
        462,5,64,0,0,461,463,5,140,0,0,462,461,1,0,0,0,462,463,1,0,0,0,463,
        464,1,0,0,0,464,465,3,16,8,0,465,466,5,140,0,0,466,467,5,47,0,0,
        467,468,5,140,0,0,468,479,3,130,65,0,469,471,5,140,0,0,470,469,1,
        0,0,0,470,471,1,0,0,0,471,472,1,0,0,0,472,474,5,5,0,0,473,475,5,
        140,0,0,474,473,1,0,0,0,474,475,1,0,0,0,475,476,1,0,0,0,476,478,
        3,130,65,0,477,470,1,0,0,0,478,481,1,0,0,0,479,477,1,0,0,0,479,480,
        1,0,0,0,480,484,1,0,0,0,481,479,1,0,0,0,482,483,5,140,0,0,483,485,
        3,24,12,0,484,482,1,0,0,0,484,485,1,0,0,0,485,21,1,0,0,0,486,487,
        5,132,0,0,487,488,5,140,0,0,488,489,5,123,0,0,489,490,5,140,0,0,
        490,492,5,64,0,0,491,493,5,140,0,0,492,491,1,0,0,0,492,493,1,0,0,
        0,493,494,1,0,0,0,494,495,3,16,8,0,495,496,5,140,0,0,496,497,5,47,
        0,0,497,498,5,140,0,0,498,509,3,130,65,0,499,501,5,140,0,0,500,499,
        1,0,0,0,500,501,1,0,0,0,501,502,1,0,0,0,502,504,5,5,0,0,503,505,
        5,140,0,0,504,503,1,0,0,0,504,505,1,0,0,0,505,506,1,0,0,0,506,508,
        3,130,65,0,507,500,1,0,0,0,508,511,1,0,0,0,509,507,1,0,0,0,509,510,
        1,0,0,0,510,514,1,0,0,0,511,509,1,0,0,0,512,513,5,140,0,0,513,515,
        3,24,12,0,514,512,1,0,0,0,514,515,1,0,0,0,515,23,1,0,0,0,516,517,
        5,94,0,0,517,518,5,140,0,0,518,525,5,127,0,0,519,520,5,94,0,0,520,
        521,5,140,0,0,521,522,5,89,0,0,522,523,5,140,0,0,523,525,5,95,0,
        0,524,516,1,0,0,0,524,519,1,0,0,0,525,25,1,0,0,0,526,533,3,30,15,
        0,527,529,5,140,0,0,528,527,1,0,0,0,528,529,1,0,0,0,529,530,1,0,
        0,0,530,532,3,28,14,0,531,528,1,0,0,0,532,535,1,0,0,0,533,531,1,
        0,0,0,533,534,1,0,0,0,534,27,1,0,0,0,535,533,1,0,0,0,536,537,5,51,
        0,0,537,538,5,140,0,0,538,540,5,52,0,0,539,541,5,140,0,0,540,539,
        1,0,0,0,540,541,1,0,0,0,541,542,1,0,0,0,542,549,3,30,15,0,543,545,
        5,51,0,0,544,546,5,140,0,0,545,544,1,0,0,0,545,546,1,0,0,0,546,547,
        1,0,0,0,547,549,3,30,15,0,548,536,1,0,0,0,548,543,1,0,0,0,549,29,
        1,0,0,0,550,553,3,32,16,0,551,553,3,34,17,0,552,550,1,0,0,0,552,
        551,1,0,0,0,553,31,1,0,0,0,554,556,3,38,19,0,555,557,5,140,0,0,556,
        555,1,0,0,0,556,557,1,0,0,0,557,559,1,0,0,0,558,554,1,0,0,0,559,
        562,1,0,0,0,560,558,1,0,0,0,560,561,1,0,0,0,561,563,1,0,0,0,562,
        560,1,0,0,0,563,590,3,76,38,0,564,566,3,38,19,0,565,567,5,140,0,
        0,566,565,1,0,0,0,566,567,1,0,0,0,567,569,1,0,0,0,568,564,1,0,0,
        0,569,572,1,0,0,0,570,568,1,0,0,0,570,571,1,0,0,0,571,573,1,0,0,
        0,572,570,1,0,0,0,573,580,3,36,18,0,574,576,5,140,0,0,575,574,1,
        0,0,0,575,576,1,0,0,0,576,577,1,0,0,0,577,579,3,36,18,0,578,575,
        1,0,0,0,579,582,1,0,0,0,580,578,1,0,0,0,580,581,1,0,0,0,581,587,
        1,0,0,0,582,580,1,0,0,0,583,585,5,140,0,0,584,583,1,0,0,0,584,585,
        1,0,0,0,585,586,1,0,0,0,586,588,3,76,38,0,587,584,1,0,0,0,587,588,
        1,0,0,0,588,590,1,0,0,0,589,560,1,0,0,0,589,570,1,0,0,0,590,33,1,
        0,0,0,591,593,3,38,19,0,592,594,5,140,0,0,593,592,1,0,0,0,593,594,
        1,0,0,0,594,596,1,0,0,0,595,591,1,0,0,0,596,599,1,0,0,0,597,595,
        1,0,0,0,597,598,1,0,0,0,598,606,1,0,0,0,599,597,1,0,0,0,600,602,
        3,36,18,0,601,603,5,140,0,0,602,601,1,0,0,0,602,603,1,0,0,0,603,
        605,1,0,0,0,604,600,1,0,0,0,605,608,1,0,0,0,606,604,1,0,0,0,606,
        607,1,0,0,0,607,609,1,0,0,0,608,606,1,0,0,0,609,611,3,74,37,0,610,
        612,5,140,0,0,611,610,1,0,0,0,611,612,1,0,0,0,612,614,1,0,0,0,613,
        597,1,0,0,0,614,615,1,0,0,0,615,613,1,0,0,0,615,616,1,0,0,0,616,
        617,1,0,0,0,617,618,3,32,16,0,618,35,1,0,0,0,619,627,3,54,27,0,620,
        627,3,50,25,0,621,627,3,60,30,0,622,627,3,56,28,0,623,627,3,62,31,
        0,624,627,3,42,21,0,625,627,3,44,22,0,626,619,1,0,0,0,626,620,1,
        0,0,0,626,621,1,0,0,0,626,622,1,0,0,0,626,623,1,0,0,0,626,624,1,
        0,0,0,626,625,1,0,0,0,627,37,1,0,0,0,628,634,3,46,23,0,629,634,3,
        48,24,0,630,634,3,66,33,0,631,634,3,44,22,0,632,634,3,40,20,0,633,
        628,1,0,0,0,633,629,1,0,0,0,633,630,1,0,0,0,633,631,1,0,0,0,633,
        632,1,0,0,0,634,39,1,0,0,0,635,636,5,53,0,0,636,637,5,140,0,0,637,
        642,5,54,0,0,638,639,5,140,0,0,639,640,5,72,0,0,640,641,5,140,0,
        0,641,643,5,55,0,0,642,638,1,0,0,0,642,643,1,0,0,0,643,644,1,0,0,
        0,644,645,5,140,0,0,645,646,5,56,0,0,646,647,5,140,0,0,647,648,3,
        130,65,0,648,649,5,140,0,0,649,650,5,62,0,0,650,651,5,140,0,0,651,
        656,3,204,102,0,652,653,5,140,0,0,653,654,5,57,0,0,654,655,5,140,
        0,0,655,657,5,121,0,0,656,652,1,0,0,0,656,657,1,0,0,0,657,41,1,0,
        0,0,658,660,5,58,0,0,659,661,5,140,0,0,660,659,1,0,0,0,660,661,1,
        0,0,0,661,662,1,0,0,0,662,664,5,4,0,0,663,665,5,140,0,0,664,663,
        1,0,0,0,664,665,1,0,0,0,665,666,1,0,0,0,666,667,3,204,102,0,667,
        668,5,140,0,0,668,669,5,93,0,0,669,670,5,140,0,0,670,672,3,130,65,
        0,671,673,5,140,0,0,672,671,1,0,0,0,672,673,1,0,0,0,673,674,1,0,
        0,0,674,679,5,7,0,0,675,677,5,140,0,0,676,675,1,0,0,0,676,677,1,
        0,0,0,677,678,1,0,0,0,678,680,3,36,18,0,679,676,1,0,0,0,680,681,
        1,0,0,0,681,679,1,0,0,0,681,682,1,0,0,0,682,684,1,0,0,0,683,685,
        5,140,0,0,684,683,1,0,0,0,684,685,1,0,0,0,685,686,1,0,0,0,686,687,
        5,6,0,0,687,43,1,0,0,0,688,690,5,70,0,0,689,691,5,140,0,0,690,689,
        1,0,0,0,690,691,1,0,0,0,691,692,1,0,0,0,692,694,5,8,0,0,693,695,
        5,140,0,0,694,693,1,0,0,0,694,695,1,0,0,0,695,696,1,0,0,0,696,698,
        3,26,13,0,697,699,5,140,0,0,698,697,1,0,0,0,698,699,1,0,0,0,699,
        700,1,0,0,0,700,701,5,9,0,0,701,45,1,0,0,0,702,703,5,59,0,0,703,
        705,5,140,0,0,704,702,1,0,0,0,704,705,1,0,0,0,705,706,1,0,0,0,706,
        708,5,60,0,0,707,709,5,140,0,0,708,707,1,0,0,0,708,709,1,0,0,0,709,
        710,1,0,0,0,710,715,3,94,47,0,711,713,5,140,0,0,712,711,1,0,0,0,
        712,713,1,0,0,0,713,714,1,0,0,0,714,716,3,92,46,0,715,712,1,0,0,
        0,715,716,1,0,0,0,716,47,1,0,0,0,717,719,5,61,0,0,718,720,5,140,
        0,0,719,718,1,0,0,0,719,720,1,0,0,0,720,721,1,0,0,0,721,722,3,130,
        65,0,722,723,5,140,0,0,723,724,5,62,0,0,724,725,5,140,0,0,725,726,
        3,204,102,0,726,49,1,0,0,0,727,729,5,63,0,0,728,730,5,140,0,0,729,
        728,1,0,0,0,729,730,1,0,0,0,730,731,1,0,0,0,731,736,3,96,48,0,732,
        733,5,140,0,0,733,735,3,52,26,0,734,732,1,0,0,0,735,738,1,0,0,0,
        736,734,1,0,0,0,736,737,1,0,0,0,737,51,1,0,0,0,738,736,1,0,0,0,739,
        740,5,64,0,0,740,741,5,140,0,0,741,742,5,60,0,0,742,743,5,140,0,
        0,743,750,3,56,28,0,744,745,5,64,0,0,745,746,5,140,0,0,746,747,5,
        65,0,0,747,748,5,140,0,0,748,750,3,56,28,0,749,739,1,0,0,0,749,744,
        1,0,0,0,750,53,1,0,0,0,751,753,5,65,0,0,752,754,5,140,0,0,753,752,
        1,0,0,0,753,754,1,0,0,0,754,755,1,0,0,0,755,756,3,94,47,0,756,55,
        1,0,0,0,757,759,5,66,0,0,758,760,5,140,0,0,759,758,1,0,0,0,759,760,
        1,0,0,0,760,761,1,0,0,0,761,772,3,58,29,0,762,764,5,140,0,0,763,
        762,1,0,0,0,763,764,1,0,0,0,764,765,1,0,0,0,765,767,5,5,0,0,766,
        768,5,140,0,0,767,766,1,0,0,0,767,768,1,0,0,0,768,769,1,0,0,0,769,
        771,3,58,29,0,770,763,1,0,0,0,771,774,1,0,0,0,772,770,1,0,0,0,772,
        773,1,0,0,0,773,57,1,0,0,0,774,772,1,0,0,0,775,777,3,128,64,0,776,
        778,5,140,0,0,777,776,1,0,0,0,777,778,1,0,0,0,778,779,1,0,0,0,779,
        781,5,2,0,0,780,782,5,140,0,0,781,780,1,0,0,0,781,782,1,0,0,0,782,
        783,1,0,0,0,783,784,3,130,65,0,784,812,1,0,0,0,785,787,3,204,102,
        0,786,788,5,140,0,0,787,786,1,0,0,0,787,788,1,0,0,0,788,789,1,0,
        0,0,789,791,5,2,0,0,790,792,5,140,0,0,791,790,1,0,0,0,791,792,1,
        0,0,0,792,793,1,0,0,0,793,794,3,130,65,0,794,812,1,0,0,0,795,797,
        3,204,102,0,796,798,5,140,0,0,797,796,1,0,0,0,797,798,1,0,0,0,798,
        799,1,0,0,0,799,801,5,10,0,0,800,802,5,140,0,0,801,800,1,0,0,0,801,
        802,1,0,0,0,802,803,1,0,0,0,803,804,3,130,65,0,804,812,1,0,0,0,805,
        807,3,204,102,0,806,808,5,140,0,0,807,806,1,0,0,0,807,808,1,0,0,
        0,808,809,1,0,0,0,809,810,3,118,59,0,810,812,1,0,0,0,811,775,1,0,
        0,0,811,785,1,0,0,0,811,795,1,0,0,0,811,805,1,0,0,0,812,59,1,0,0,
        0,813,814,5,67,0,0,814,816,5,140,0,0,815,813,1,0,0,0,815,816,1,0,
        0,0,816,817,1,0,0,0,817,819,5,68,0,0,818,820,5,140,0,0,819,818,1,
        0,0,0,819,820,1,0,0,0,820,821,1,0,0,0,821,832,3,130,65,0,822,824,
        5,140,0,0,823,822,1,0,0,0,823,824,1,0,0,0,824,825,1,0,0,0,825,827,
        5,5,0,0,826,828,5,140,0,0,827,826,1,0,0,0,827,828,1,0,0,0,828,829,
        1,0,0,0,829,831,3,130,65,0,830,823,1,0,0,0,831,834,1,0,0,0,832,830,
        1,0,0,0,832,833,1,0,0,0,833,61,1,0,0,0,834,832,1,0,0,0,835,836,5,
        69,0,0,836,837,5,140,0,0,837,848,3,64,32,0,838,840,5,140,0,0,839,
        838,1,0,0,0,839,840,1,0,0,0,840,841,1,0,0,0,841,843,5,5,0,0,842,
        844,5,140,0,0,843,842,1,0,0,0,843,844,1,0,0,0,844,845,1,0,0,0,845,
        847,3,64,32,0,846,839,1,0,0,0,847,850,1,0,0,0,848,846,1,0,0,0,848,
        849,1,0,0,0,849,63,1,0,0,0,850,848,1,0,0,0,851,852,3,204,102,0,852,
        853,3,118,59,0,853,856,1,0,0,0,854,856,3,128,64,0,855,851,1,0,0,
        0,855,854,1,0,0,0,856,65,1,0,0,0,857,858,5,70,0,0,858,859,5,140,
        0,0,859,866,3,194,97,0,860,862,5,140,0,0,861,860,1,0,0,0,861,862,
        1,0,0,0,862,863,1,0,0,0,863,864,5,71,0,0,864,865,5,140,0,0,865,867,
        3,70,35,0,866,861,1,0,0,0,866,867,1,0,0,0,867,67,1,0,0,0,868,869,
        5,70,0,0,869,872,5,140,0,0,870,873,3,194,97,0,871,873,3,196,98,0,
        872,870,1,0,0,0,872,871,1,0,0,0,873,883,1,0,0,0,874,876,5,140,0,
        0,875,874,1,0,0,0,875,876,1,0,0,0,876,877,1,0,0,0,877,878,5,71,0,
        0,878,881,5,140,0,0,879,882,5,11,0,0,880,882,3,70,35,0,881,879,1,
        0,0,0,881,880,1,0,0,0,882,884,1,0,0,0,883,875,1,0,0,0,883,884,1,
        0,0,0,884,69,1,0,0,0,885,896,3,72,36,0,886,888,5,140,0,0,887,886,
        1,0,0,0,887,888,1,0,0,0,888,889,1,0,0,0,889,891,5,5,0,0,890,892,
        5,140,0,0,891,890,1,0,0,0,891,892,1,0,0,0,892,893,1,0,0,0,893,895,
        3,72,36,0,894,887,1,0,0,0,895,898,1,0,0,0,896,894,1,0,0,0,896,897,
        1,0,0,0,897,903,1,0,0,0,898,896,1,0,0,0,899,901,5,140,0,0,900,899,
        1,0,0,0,900,901,1,0,0,0,901,902,1,0,0,0,902,904,3,92,46,0,903,900,
        1,0,0,0,903,904,1,0,0,0,904,71,1,0,0,0,905,906,3,198,99,0,906,907,
        5,140,0,0,907,908,5,62,0,0,908,909,5,140,0,0,909,911,1,0,0,0,910,
        905,1,0,0,0,910,911,1,0,0,0,911,912,1,0,0,0,912,913,3,204,102,0,
        913,73,1,0,0,0,914,915,5,72,0,0,915,920,3,78,39,0,916,918,5,140,
        0,0,917,916,1,0,0,0,917,918,1,0,0,0,918,919,1,0,0,0,919,921,3,92,
        46,0,920,917,1,0,0,0,920,921,1,0,0,0,921,75,1,0,0,0,922,923,5,73,
        0,0,923,924,3,78,39,0,924,77,1,0,0,0,925,927,5,140,0,0,926,925,1,
        0,0,0,926,927,1,0,0,0,927,928,1,0,0,0,928,930,5,74,0,0,929,926,1,
        0,0,0,929,930,1,0,0,0,930,931,1,0,0,0,931,932,5,140,0,0,932,935,
        3,80,40,0,933,934,5,140,0,0,934,936,3,84,42,0,935,933,1,0,0,0,935,
        936,1,0,0,0,936,939,1,0,0,0,937,938,5,140,0,0,938,940,3,86,43,0,
        939,937,1,0,0,0,939,940,1,0,0,0,940,943,1,0,0,0,941,942,5,140,0,
        0,942,944,3,88,44,0,943,941,1,0,0,0,943,944,1,0,0,0,944,79,1,0,0,
        0,945,956,5,11,0,0,946,948,5,140,0,0,947,946,1,0,0,0,947,948,1,0,
        0,0,948,949,1,0,0,0,949,951,5,5,0,0,950,952,5,140,0,0,951,950,1,
        0,0,0,951,952,1,0,0,0,952,953,1,0,0,0,953,955,3,82,41,0,954,947,
        1,0,0,0,955,958,1,0,0,0,956,954,1,0,0,0,956,957,1,0,0,0,957,974,
        1,0,0,0,958,956,1,0,0,0,959,970,3,82,41,0,960,962,5,140,0,0,961,
        960,1,0,0,0,961,962,1,0,0,0,962,963,1,0,0,0,963,965,5,5,0,0,964,
        966,5,140,0,0,965,964,1,0,0,0,965,966,1,0,0,0,966,967,1,0,0,0,967,
        969,3,82,41,0,968,961,1,0,0,0,969,972,1,0,0,0,970,968,1,0,0,0,970,
        971,1,0,0,0,971,974,1,0,0,0,972,970,1,0,0,0,973,945,1,0,0,0,973,
        959,1,0,0,0,974,81,1,0,0,0,975,976,3,130,65,0,976,977,5,140,0,0,
        977,978,5,62,0,0,978,979,5,140,0,0,979,980,3,204,102,0,980,983,1,
        0,0,0,981,983,3,130,65,0,982,975,1,0,0,0,982,981,1,0,0,0,983,83,
        1,0,0,0,984,985,5,75,0,0,985,986,5,140,0,0,986,987,5,76,0,0,987,
        988,5,140,0,0,988,996,3,90,45,0,989,991,5,5,0,0,990,992,5,140,0,
        0,991,990,1,0,0,0,991,992,1,0,0,0,992,993,1,0,0,0,993,995,3,90,45,
        0,994,989,1,0,0,0,995,998,1,0,0,0,996,994,1,0,0,0,996,997,1,0,0,
        0,997,85,1,0,0,0,998,996,1,0,0,0,999,1000,5,77,0,0,1000,1001,5,140,
        0,0,1001,1002,3,130,65,0,1002,87,1,0,0,0,1003,1004,5,78,0,0,1004,
        1005,5,140,0,0,1005,1006,3,130,65,0,1006,89,1,0,0,0,1007,1012,3,
        130,65,0,1008,1010,5,140,0,0,1009,1008,1,0,0,0,1009,1010,1,0,0,0,
        1010,1011,1,0,0,0,1011,1013,7,1,0,0,1012,1009,1,0,0,0,1012,1013,
        1,0,0,0,1013,91,1,0,0,0,1014,1015,5,83,0,0,1015,1016,5,140,0,0,1016,
        1017,3,130,65,0,1017,93,1,0,0,0,1018,1029,3,96,48,0,1019,1021,5,
        140,0,0,1020,1019,1,0,0,0,1020,1021,1,0,0,0,1021,1022,1,0,0,0,1022,
        1024,5,5,0,0,1023,1025,5,140,0,0,1024,1023,1,0,0,0,1024,1025,1,0,
        0,0,1025,1026,1,0,0,0,1026,1028,3,96,48,0,1027,1020,1,0,0,0,1028,
        1031,1,0,0,0,1029,1027,1,0,0,0,1029,1030,1,0,0,0,1030,95,1,0,0,0,
        1031,1029,1,0,0,0,1032,1034,3,204,102,0,1033,1035,5,140,0,0,1034,
        1033,1,0,0,0,1034,1035,1,0,0,0,1035,1036,1,0,0,0,1036,1038,5,2,0,
        0,1037,1039,5,140,0,0,1038,1037,1,0,0,0,1038,1039,1,0,0,0,1039,1040,
        1,0,0,0,1040,1041,3,98,49,0,1041,1044,1,0,0,0,1042,1044,3,98,49,
        0,1043,1032,1,0,0,0,1043,1042,1,0,0,0,1044,97,1,0,0,0,1045,1048,
        3,100,50,0,1046,1048,3,102,51,0,1047,1045,1,0,0,0,1047,1046,1,0,
        0,0,1048,99,1,0,0,0,1049,1051,7,2,0,0,1050,1052,5,140,0,0,1051,1050,
        1,0,0,0,1051,1052,1,0,0,0,1052,1053,1,0,0,0,1053,1055,5,4,0,0,1054,
        1056,5,140,0,0,1055,1054,1,0,0,0,1055,1056,1,0,0,0,1056,1057,1,0,
        0,0,1057,1059,3,102,51,0,1058,1060,5,140,0,0,1059,1058,1,0,0,0,1059,
        1060,1,0,0,0,1060,1061,1,0,0,0,1061,1062,5,6,0,0,1062,101,1,0,0,
        0,1063,1070,3,106,53,0,1064,1066,5,140,0,0,1065,1064,1,0,0,0,1065,
        1066,1,0,0,0,1066,1067,1,0,0,0,1067,1069,3,108,54,0,1068,1065,1,
        0,0,0,1069,1072,1,0,0,0,1070,1068,1,0,0,0,1070,1071,1,0,0,0,1071,
        1078,1,0,0,0,1072,1070,1,0,0,0,1073,1074,5,4,0,0,1074,1075,3,102,
        51,0,1075,1076,5,6,0,0,1076,1078,1,0,0,0,1077,1063,1,0,0,0,1077,
        1073,1,0,0,0,1078,103,1,0,0,0,1079,1084,3,106,53,0,1080,1082,5,140,
        0,0,1081,1080,1,0,0,0,1081,1082,1,0,0,0,1082,1083,1,0,0,0,1083,1085,
        3,108,54,0,1084,1081,1,0,0,0,1085,1086,1,0,0,0,1086,1084,1,0,0,0,
        1086,1087,1,0,0,0,1087,105,1,0,0,0,1088,1090,5,4,0,0,1089,1091,5,
        140,0,0,1090,1089,1,0,0,0,1090,1091,1,0,0,0,1091,1096,1,0,0,0,1092,
        1094,3,204,102,0,1093,1095,5,140,0,0,1094,1093,1,0,0,0,1094,1095,
        1,0,0,0,1095,1097,1,0,0,0,1096,1092,1,0,0,0,1096,1097,1,0,0,0,1097,
        1102,1,0,0,0,1098,1100,3,118,59,0,1099,1101,5,140,0,0,1100,1099,
        1,0,0,0,1100,1101,1,0,0,0,1101,1103,1,0,0,0,1102,1098,1,0,0,0,1102,
        1103,1,0,0,0,1103,1108,1,0,0,0,1104,1106,3,114,57,0,1105,1107,5,
        140,0,0,1106,1105,1,0,0,0,1106,1107,1,0,0,0,1107,1109,1,0,0,0,1108,
        1104,1,0,0,0,1108,1109,1,0,0,0,1109,1110,1,0,0,0,1110,1111,5,6,0,
        0,1111,107,1,0,0,0,1112,1114,3,110,55,0,1113,1115,5,140,0,0,1114,
        1113,1,0,0,0,1114,1115,1,0,0,0,1115,1116,1,0,0,0,1116,1117,3,106,
        53,0,1117,109,1,0,0,0,1118,1120,3,230,115,0,1119,1121,5,140,0,0,
        1120,1119,1,0,0,0,1120,1121,1,0,0,0,1121,1122,1,0,0,0,1122,1124,
        3,234,117,0,1123,1125,5,140,0,0,1124,1123,1,0,0,0,1124,1125,1,0,
        0,0,1125,1127,1,0,0,0,1126,1128,3,112,56,0,1127,1126,1,0,0,0,1127,
        1128,1,0,0,0,1128,1130,1,0,0,0,1129,1131,5,140,0,0,1130,1129,1,0,
        0,0,1130,1131,1,0,0,0,1131,1132,1,0,0,0,1132,1134,3,234,117,0,1133,
        1135,5,140,0,0,1134,1133,1,0,0,0,1134,1135,1,0,0,0,1135,1136,1,0,
        0,0,1136,1137,3,232,116,0,1137,1183,1,0,0,0,1138,1140,3,230,115,
        0,1139,1141,5,140,0,0,1140,1139,1,0,0,0,1140,1141,1,0,0,0,1141,1142,
        1,0,0,0,1142,1144,3,234,117,0,1143,1145,5,140,0,0,1144,1143,1,0,
        0,0,1144,1145,1,0,0,0,1145,1147,1,0,0,0,1146,1148,3,112,56,0,1147,
        1146,1,0,0,0,1147,1148,1,0,0,0,1148,1150,1,0,0,0,1149,1151,5,140,
        0,0,1150,1149,1,0,0,0,1150,1151,1,0,0,0,1151,1152,1,0,0,0,1152,1153,
        3,234,117,0,1153,1183,1,0,0,0,1154,1156,3,234,117,0,1155,1157,5,
        140,0,0,1156,1155,1,0,0,0,1156,1157,1,0,0,0,1157,1159,1,0,0,0,1158,
        1160,3,112,56,0,1159,1158,1,0,0,0,1159,1160,1,0,0,0,1160,1162,1,
        0,0,0,1161,1163,5,140,0,0,1162,1161,1,0,0,0,1162,1163,1,0,0,0,1163,
        1164,1,0,0,0,1164,1166,3,234,117,0,1165,1167,5,140,0,0,1166,1165,
        1,0,0,0,1166,1167,1,0,0,0,1167,1168,1,0,0,0,1168,1169,3,232,116,
        0,1169,1183,1,0,0,0,1170,1172,3,234,117,0,1171,1173,5,140,0,0,1172,
        1171,1,0,0,0,1172,1173,1,0,0,0,1173,1175,1,0,0,0,1174,1176,3,112,
        56,0,1175,1174,1,0,0,0,1175,1176,1,0,0,0,1176,1178,1,0,0,0,1177,
        1179,5,140,0,0,1178,1177,1,0,0,0,1178,1179,1,0,0,0,1179,1180,1,0,
        0,0,1180,1181,3,234,117,0,1181,1183,1,0,0,0,1182,1118,1,0,0,0,1182,
        1138,1,0,0,0,1182,1154,1,0,0,0,1182,1170,1,0,0,0,1183,111,1,0,0,
        0,1184,1186,5,12,0,0,1185,1187,5,140,0,0,1186,1185,1,0,0,0,1186,
        1187,1,0,0,0,1187,1192,1,0,0,0,1188,1190,3,204,102,0,1189,1191,5,
        140,0,0,1190,1189,1,0,0,0,1190,1191,1,0,0,0,1191,1193,1,0,0,0,1192,
        1188,1,0,0,0,1192,1193,1,0,0,0,1193,1198,1,0,0,0,1194,1196,3,116,
        58,0,1195,1197,5,140,0,0,1196,1195,1,0,0,0,1196,1197,1,0,0,0,1197,
        1199,1,0,0,0,1198,1194,1,0,0,0,1198,1199,1,0,0,0,1199,1201,1,0,0,
        0,1200,1202,3,122,61,0,1201,1200,1,0,0,0,1201,1202,1,0,0,0,1202,
        1207,1,0,0,0,1203,1205,3,114,57,0,1204,1206,5,140,0,0,1205,1204,
        1,0,0,0,1205,1206,1,0,0,0,1206,1208,1,0,0,0,1207,1203,1,0,0,0,1207,
        1208,1,0,0,0,1208,1209,1,0,0,0,1209,1210,5,13,0,0,1210,113,1,0,0,
        0,1211,1214,3,218,109,0,1212,1214,3,222,111,0,1213,1211,1,0,0,0,
        1213,1212,1,0,0,0,1214,115,1,0,0,0,1215,1217,5,3,0,0,1216,1218,5,
        140,0,0,1217,1216,1,0,0,0,1217,1218,1,0,0,0,1218,1219,1,0,0,0,1219,
        1233,3,126,63,0,1220,1222,5,140,0,0,1221,1220,1,0,0,0,1221,1222,
        1,0,0,0,1222,1223,1,0,0,0,1223,1225,5,7,0,0,1224,1226,5,3,0,0,1225,
        1224,1,0,0,0,1225,1226,1,0,0,0,1226,1228,1,0,0,0,1227,1229,5,140,
        0,0,1228,1227,1,0,0,0,1228,1229,1,0,0,0,1229,1230,1,0,0,0,1230,1232,
        3,126,63,0,1231,1221,1,0,0,0,1232,1235,1,0,0,0,1233,1231,1,0,0,0,
        1233,1234,1,0,0,0,1234,117,1,0,0,0,1235,1233,1,0,0,0,1236,1243,3,
        120,60,0,1237,1239,5,140,0,0,1238,1237,1,0,0,0,1238,1239,1,0,0,0,
        1239,1240,1,0,0,0,1240,1242,3,120,60,0,1241,1238,1,0,0,0,1242,1245,
        1,0,0,0,1243,1241,1,0,0,0,1243,1244,1,0,0,0,1244,119,1,0,0,0,1245,
        1243,1,0,0,0,1246,1248,5,3,0,0,1247,1249,5,140,0,0,1248,1247,1,0,
        0,0,1248,1249,1,0,0,0,1249,1250,1,0,0,0,1250,1251,3,124,62,0,1251,
        121,1,0,0,0,1252,1254,5,11,0,0,1253,1255,5,140,0,0,1254,1253,1,0,
        0,0,1254,1255,1,0,0,0,1255,1260,1,0,0,0,1256,1258,3,212,106,0,1257,
        1259,5,140,0,0,1258,1257,1,0,0,0,1258,1259,1,0,0,0,1259,1261,1,0,
        0,0,1260,1256,1,0,0,0,1260,1261,1,0,0,0,1261,1272,1,0,0,0,1262,1264,
        5,14,0,0,1263,1265,5,140,0,0,1264,1263,1,0,0,0,1264,1265,1,0,0,0,
        1265,1270,1,0,0,0,1266,1268,3,212,106,0,1267,1269,5,140,0,0,1268,
        1267,1,0,0,0,1268,1269,1,0,0,0,1269,1271,1,0,0,0,1270,1266,1,0,0,
        0,1270,1271,1,0,0,0,1271,1273,1,0,0,0,1272,1262,1,0,0,0,1272,1273,
        1,0,0,0,1273,123,1,0,0,0,1274,1275,3,224,112,0,1275,125,1,0,0,0,
        1276,1277,3,224,112,0,1277,127,1,0,0,0,1278,1283,3,166,83,0,1279,
        1281,5,140,0,0,1280,1279,1,0,0,0,1280,1281,1,0,0,0,1281,1282,1,0,
        0,0,1282,1284,3,164,82,0,1283,1280,1,0,0,0,1284,1285,1,0,0,0,1285,
        1283,1,0,0,0,1285,1286,1,0,0,0,1286,129,1,0,0,0,1287,1288,3,132,
        66,0,1288,131,1,0,0,0,1289,1296,3,134,67,0,1290,1291,5,140,0,0,1291,
        1292,5,86,0,0,1292,1293,5,140,0,0,1293,1295,3,134,67,0,1294,1290,
        1,0,0,0,1295,1298,1,0,0,0,1296,1294,1,0,0,0,1296,1297,1,0,0,0,1297,
        133,1,0,0,0,1298,1296,1,0,0,0,1299,1306,3,136,68,0,1300,1301,5,140,
        0,0,1301,1302,5,87,0,0,1302,1303,5,140,0,0,1303,1305,3,136,68,0,
        1304,1300,1,0,0,0,1305,1308,1,0,0,0,1306,1304,1,0,0,0,1306,1307,
        1,0,0,0,1307,135,1,0,0,0,1308,1306,1,0,0,0,1309,1316,3,138,69,0,
        1310,1311,5,140,0,0,1311,1312,5,88,0,0,1312,1313,5,140,0,0,1313,
        1315,3,138,69,0,1314,1310,1,0,0,0,1315,1318,1,0,0,0,1316,1314,1,
        0,0,0,1316,1317,1,0,0,0,1317,137,1,0,0,0,1318,1316,1,0,0,0,1319,
        1321,5,89,0,0,1320,1322,5,140,0,0,1321,1320,1,0,0,0,1321,1322,1,
        0,0,0,1322,1324,1,0,0,0,1323,1319,1,0,0,0,1324,1327,1,0,0,0,1325,
        1323,1,0,0,0,1325,1326,1,0,0,0,1326,1328,1,0,0,0,1327,1325,1,0,0,
        0,1328,1329,3,140,70,0,1329,139,1,0,0,0,1330,1337,3,144,72,0,1331,
        1333,5,140,0,0,1332,1331,1,0,0,0,1332,1333,1,0,0,0,1333,1334,1,0,
        0,0,1334,1336,3,142,71,0,1335,1332,1,0,0,0,1336,1339,1,0,0,0,1337,
        1335,1,0,0,0,1337,1338,1,0,0,0,1338,141,1,0,0,0,1339,1337,1,0,0,
        0,1340,1342,5,2,0,0,1341,1343,5,140,0,0,1342,1341,1,0,0,0,1342,1343,
        1,0,0,0,1343,1344,1,0,0,0,1344,1371,3,144,72,0,1345,1347,5,15,0,
        0,1346,1348,5,140,0,0,1347,1346,1,0,0,0,1347,1348,1,0,0,0,1348,1349,
        1,0,0,0,1349,1371,3,144,72,0,1350,1352,5,16,0,0,1351,1353,5,140,
        0,0,1352,1351,1,0,0,0,1352,1353,1,0,0,0,1353,1354,1,0,0,0,1354,1371,
        3,144,72,0,1355,1357,5,17,0,0,1356,1358,5,140,0,0,1357,1356,1,0,
        0,0,1357,1358,1,0,0,0,1358,1359,1,0,0,0,1359,1371,3,144,72,0,1360,
        1362,5,18,0,0,1361,1363,5,140,0,0,1362,1361,1,0,0,0,1362,1363,1,
        0,0,0,1363,1364,1,0,0,0,1364,1371,3,144,72,0,1365,1367,5,19,0,0,
        1366,1368,5,140,0,0,1367,1366,1,0,0,0,1367,1368,1,0,0,0,1368,1369,
        1,0,0,0,1369,1371,3,144,72,0,1370,1340,1,0,0,0,1370,1345,1,0,0,0,
        1370,1350,1,0,0,0,1370,1355,1,0,0,0,1370,1360,1,0,0,0,1370,1365,
        1,0,0,0,1371,143,1,0,0,0,1372,1378,3,152,76,0,1373,1377,3,146,73,
        0,1374,1377,3,148,74,0,1375,1377,3,150,75,0,1376,1373,1,0,0,0,1376,
        1374,1,0,0,0,1376,1375,1,0,0,0,1377,1380,1,0,0,0,1378,1376,1,0,0,
        0,1378,1379,1,0,0,0,1379,145,1,0,0,0,1380,1378,1,0,0,0,1381,1382,
        5,140,0,0,1382,1383,5,90,0,0,1383,1384,5,140,0,0,1384,1392,5,72,
        0,0,1385,1386,5,140,0,0,1386,1387,5,91,0,0,1387,1388,5,140,0,0,1388,
        1392,5,72,0,0,1389,1390,5,140,0,0,1390,1392,5,92,0,0,1391,1381,1,
        0,0,0,1391,1385,1,0,0,0,1391,1389,1,0,0,0,1392,1394,1,0,0,0,1393,
        1395,5,140,0,0,1394,1393,1,0,0,0,1394,1395,1,0,0,0,1395,1396,1,0,
        0,0,1396,1397,3,152,76,0,1397,147,1,0,0,0,1398,1399,5,140,0,0,1399,
        1401,5,93,0,0,1400,1402,5,140,0,0,1401,1400,1,0,0,0,1401,1402,1,
        0,0,0,1402,1403,1,0,0,0,1403,1404,3,152,76,0,1404,149,1,0,0,0,1405,
        1406,5,140,0,0,1406,1407,5,94,0,0,1407,1408,5,140,0,0,1408,1416,
        5,95,0,0,1409,1410,5,140,0,0,1410,1411,5,94,0,0,1411,1412,5,140,
        0,0,1412,1413,5,89,0,0,1413,1414,5,140,0,0,1414,1416,5,95,0,0,1415,
        1405,1,0,0,0,1415,1409,1,0,0,0,1416,151,1,0,0,0,1417,1436,3,154,
        77,0,1418,1420,5,140,0,0,1419,1418,1,0,0,0,1419,1420,1,0,0,0,1420,
        1421,1,0,0,0,1421,1423,5,20,0,0,1422,1424,5,140,0,0,1423,1422,1,
        0,0,0,1423,1424,1,0,0,0,1424,1425,1,0,0,0,1425,1435,3,154,77,0,1426,
        1428,5,140,0,0,1427,1426,1,0,0,0,1427,1428,1,0,0,0,1428,1429,1,0,
        0,0,1429,1431,5,21,0,0,1430,1432,5,140,0,0,1431,1430,1,0,0,0,1431,
        1432,1,0,0,0,1432,1433,1,0,0,0,1433,1435,3,154,77,0,1434,1419,1,
        0,0,0,1434,1427,1,0,0,0,1435,1438,1,0,0,0,1436,1434,1,0,0,0,1436,
        1437,1,0,0,0,1437,153,1,0,0,0,1438,1436,1,0,0,0,1439,1466,3,156,
        78,0,1440,1442,5,140,0,0,1441,1440,1,0,0,0,1441,1442,1,0,0,0,1442,
        1443,1,0,0,0,1443,1445,5,11,0,0,1444,1446,5,140,0,0,1445,1444,1,
        0,0,0,1445,1446,1,0,0,0,1446,1447,1,0,0,0,1447,1465,3,156,78,0,1448,
        1450,5,140,0,0,1449,1448,1,0,0,0,1449,1450,1,0,0,0,1450,1451,1,0,
        0,0,1451,1453,5,22,0,0,1452,1454,5,140,0,0,1453,1452,1,0,0,0,1453,
        1454,1,0,0,0,1454,1455,1,0,0,0,1455,1465,3,156,78,0,1456,1458,5,
        140,0,0,1457,1456,1,0,0,0,1457,1458,1,0,0,0,1458,1459,1,0,0,0,1459,
        1461,5,23,0,0,1460,1462,5,140,0,0,1461,1460,1,0,0,0,1461,1462,1,
        0,0,0,1462,1463,1,0,0,0,1463,1465,3,156,78,0,1464,1441,1,0,0,0,1464,
        1449,1,0,0,0,1464,1457,1,0,0,0,1465,1468,1,0,0,0,1466,1464,1,0,0,
        0,1466,1467,1,0,0,0,1467,155,1,0,0,0,1468,1466,1,0,0,0,1469,1480,
        3,158,79,0,1470,1472,5,140,0,0,1471,1470,1,0,0,0,1471,1472,1,0,0,
        0,1472,1473,1,0,0,0,1473,1475,5,24,0,0,1474,1476,5,140,0,0,1475,
        1474,1,0,0,0,1475,1476,1,0,0,0,1476,1477,1,0,0,0,1477,1479,3,158,
        79,0,1478,1471,1,0,0,0,1479,1482,1,0,0,0,1480,1478,1,0,0,0,1480,
        1481,1,0,0,0,1481,157,1,0,0,0,1482,1480,1,0,0,0,1483,1490,3,160,
        80,0,1484,1486,7,3,0,0,1485,1487,5,140,0,0,1486,1485,1,0,0,0,1486,
        1487,1,0,0,0,1487,1488,1,0,0,0,1488,1490,3,160,80,0,1489,1483,1,
        0,0,0,1489,1484,1,0,0,0,1490,159,1,0,0,0,1491,1502,3,166,83,0,1492,
        1494,5,140,0,0,1493,1492,1,0,0,0,1493,1494,1,0,0,0,1494,1495,1,0,
        0,0,1495,1501,3,162,81,0,1496,1498,5,140,0,0,1497,1496,1,0,0,0,1497,
        1498,1,0,0,0,1498,1499,1,0,0,0,1499,1501,3,164,82,0,1500,1493,1,
        0,0,0,1500,1497,1,0,0,0,1501,1504,1,0,0,0,1502,1500,1,0,0,0,1502,
        1503,1,0,0,0,1503,1509,1,0,0,0,1504,1502,1,0,0,0,1505,1507,5,140,
        0,0,1506,1505,1,0,0,0,1506,1507,1,0,0,0,1507,1508,1,0,0,0,1508,1510,
        3,118,59,0,1509,1506,1,0,0,0,1509,1510,1,0,0,0,1510,161,1,0,0,0,
        1511,1512,5,12,0,0,1512,1513,3,130,65,0,1513,1514,5,13,0,0,1514,
        1525,1,0,0,0,1515,1517,5,12,0,0,1516,1518,3,130,65,0,1517,1516,1,
        0,0,0,1517,1518,1,0,0,0,1518,1519,1,0,0,0,1519,1521,5,14,0,0,1520,
        1522,3,130,65,0,1521,1520,1,0,0,0,1521,1522,1,0,0,0,1522,1523,1,
        0,0,0,1523,1525,5,13,0,0,1524,1511,1,0,0,0,1524,1515,1,0,0,0,1525,
        163,1,0,0,0,1526,1528,5,25,0,0,1527,1529,5,140,0,0,1528,1527,1,0,
        0,0,1528,1529,1,0,0,0,1529,1530,1,0,0,0,1530,1531,3,220,110,0,1531,
        165,1,0,0,0,1532,1559,3,206,103,0,1533,1559,3,222,111,0,1534,1559,
        3,168,84,0,1535,1537,5,96,0,0,1536,1538,5,140,0,0,1537,1536,1,0,
        0,0,1537,1538,1,0,0,0,1538,1539,1,0,0,0,1539,1541,5,4,0,0,1540,1542,
        5,140,0,0,1541,1540,1,0,0,0,1541,1542,1,0,0,0,1542,1543,1,0,0,0,
        1543,1545,5,11,0,0,1544,1546,5,140,0,0,1545,1544,1,0,0,0,1545,1546,
        1,0,0,0,1546,1547,1,0,0,0,1547,1559,5,6,0,0,1548,1559,3,172,86,0,
        1549,1559,3,174,87,0,1550,1559,3,186,93,0,1551,1559,3,100,50,0,1552,
        1559,3,176,88,0,1553,1559,3,180,90,0,1554,1559,3,182,91,0,1555,1559,
        3,188,94,0,1556,1559,3,192,96,0,1557,1559,3,204,102,0,1558,1532,
        1,0,0,0,1558,1533,1,0,0,0,1558,1534,1,0,0,0,1558,1535,1,0,0,0,1558,
        1548,1,0,0,0,1558,1549,1,0,0,0,1558,1550,1,0,0,0,1558,1551,1,0,0,
        0,1558,1552,1,0,0,0,1558,1553,1,0,0,0,1558,1554,1,0,0,0,1558,1555,
        1,0,0,0,1558,1556,1,0,0,0,1558,1557,1,0,0,0,1559,167,1,0,0,0,1560,
        1565,5,97,0,0,1561,1563,5,140,0,0,1562,1561,1,0,0,0,1562,1563,1,
        0,0,0,1563,1564,1,0,0,0,1564,1566,3,170,85,0,1565,1562,1,0,0,0,1566,
        1567,1,0,0,0,1567,1565,1,0,0,0,1567,1568,1,0,0,0,1568,1583,1,0,0,
        0,1569,1571,5,97,0,0,1570,1572,5,140,0,0,1571,1570,1,0,0,0,1571,
        1572,1,0,0,0,1572,1573,1,0,0,0,1573,1578,3,130,65,0,1574,1576,5,
        140,0,0,1575,1574,1,0,0,0,1575,1576,1,0,0,0,1576,1577,1,0,0,0,1577,
        1579,3,170,85,0,1578,1575,1,0,0,0,1579,1580,1,0,0,0,1580,1578,1,
        0,0,0,1580,1581,1,0,0,0,1581,1583,1,0,0,0,1582,1560,1,0,0,0,1582,
        1569,1,0,0,0,1583,1592,1,0,0,0,1584,1586,5,140,0,0,1585,1584,1,0,
        0,0,1585,1586,1,0,0,0,1586,1587,1,0,0,0,1587,1589,5,98,0,0,1588,
        1590,5,140,0,0,1589,1588,1,0,0,0,1589,1590,1,0,0,0,1590,1591,1,0,
        0,0,1591,1593,3,130,65,0,1592,1585,1,0,0,0,1592,1593,1,0,0,0,1593,
        1595,1,0,0,0,1594,1596,5,140,0,0,1595,1594,1,0,0,0,1595,1596,1,0,
        0,0,1596,1597,1,0,0,0,1597,1598,5,99,0,0,1598,169,1,0,0,0,1599,1601,
        5,100,0,0,1600,1602,5,140,0,0,1601,1600,1,0,0,0,1601,1602,1,0,0,
        0,1602,1603,1,0,0,0,1603,1605,3,130,65,0,1604,1606,5,140,0,0,1605,
        1604,1,0,0,0,1605,1606,1,0,0,0,1606,1607,1,0,0,0,1607,1609,5,101,
        0,0,1608,1610,5,140,0,0,1609,1608,1,0,0,0,1609,1610,1,0,0,0,1610,
        1611,1,0,0,0,1611,1612,3,130,65,0,1612,171,1,0,0,0,1613,1615,5,12,
        0,0,1614,1616,5,140,0,0,1615,1614,1,0,0,0,1615,1616,1,0,0,0,1616,
        1617,1,0,0,0,1617,1626,3,178,89,0,1618,1620,5,140,0,0,1619,1618,
        1,0,0,0,1619,1620,1,0,0,0,1620,1621,1,0,0,0,1621,1623,5,7,0,0,1622,
        1624,5,140,0,0,1623,1622,1,0,0,0,1623,1624,1,0,0,0,1624,1625,1,0,
        0,0,1625,1627,3,130,65,0,1626,1619,1,0,0,0,1626,1627,1,0,0,0,1627,
        1629,1,0,0,0,1628,1630,5,140,0,0,1629,1628,1,0,0,0,1629,1630,1,0,
        0,0,1630,1631,1,0,0,0,1631,1632,5,13,0,0,1632,173,1,0,0,0,1633,1635,
        5,12,0,0,1634,1636,5,140,0,0,1635,1634,1,0,0,0,1635,1636,1,0,0,0,
        1636,1645,1,0,0,0,1637,1639,3,204,102,0,1638,1640,5,140,0,0,1639,
        1638,1,0,0,0,1639,1640,1,0,0,0,1640,1641,1,0,0,0,1641,1643,5,2,0,
        0,1642,1644,5,140,0,0,1643,1642,1,0,0,0,1643,1644,1,0,0,0,1644,1646,
        1,0,0,0,1645,1637,1,0,0,0,1645,1646,1,0,0,0,1646,1647,1,0,0,0,1647,
        1649,3,104,52,0,1648,1650,5,140,0,0,1649,1648,1,0,0,0,1649,1650,
        1,0,0,0,1650,1655,1,0,0,0,1651,1653,3,92,46,0,1652,1654,5,140,0,
        0,1653,1652,1,0,0,0,1653,1654,1,0,0,0,1654,1656,1,0,0,0,1655,1651,
        1,0,0,0,1655,1656,1,0,0,0,1656,1657,1,0,0,0,1657,1659,5,7,0,0,1658,
        1660,5,140,0,0,1659,1658,1,0,0,0,1659,1660,1,0,0,0,1660,1661,1,0,
        0,0,1661,1663,3,130,65,0,1662,1664,5,140,0,0,1663,1662,1,0,0,0,1663,
        1664,1,0,0,0,1664,1665,1,0,0,0,1665,1666,5,13,0,0,1666,175,1,0,0,
        0,1667,1669,5,52,0,0,1668,1670,5,140,0,0,1669,1668,1,0,0,0,1669,
        1670,1,0,0,0,1670,1671,1,0,0,0,1671,1673,5,4,0,0,1672,1674,5,140,
        0,0,1673,1672,1,0,0,0,1673,1674,1,0,0,0,1674,1675,1,0,0,0,1675,1677,
        3,178,89,0,1676,1678,5,140,0,0,1677,1676,1,0,0,0,1677,1678,1,0,0,
        0,1678,1679,1,0,0,0,1679,1680,5,6,0,0,1680,1724,1,0,0,0,1681,1683,
        5,102,0,0,1682,1684,5,140,0,0,1683,1682,1,0,0,0,1683,1684,1,0,0,
        0,1684,1685,1,0,0,0,1685,1687,5,4,0,0,1686,1688,5,140,0,0,1687,1686,
        1,0,0,0,1687,1688,1,0,0,0,1688,1689,1,0,0,0,1689,1691,3,178,89,0,
        1690,1692,5,140,0,0,1691,1690,1,0,0,0,1691,1692,1,0,0,0,1692,1693,
        1,0,0,0,1693,1694,5,6,0,0,1694,1724,1,0,0,0,1695,1697,5,103,0,0,
        1696,1698,5,140,0,0,1697,1696,1,0,0,0,1697,1698,1,0,0,0,1698,1699,
        1,0,0,0,1699,1701,5,4,0,0,1700,1702,5,140,0,0,1701,1700,1,0,0,0,
        1701,1702,1,0,0,0,1702,1703,1,0,0,0,1703,1705,3,178,89,0,1704,1706,
        5,140,0,0,1705,1704,1,0,0,0,1705,1706,1,0,0,0,1706,1707,1,0,0,0,
        1707,1708,5,6,0,0,1708,1724,1,0,0,0,1709,1711,5,104,0,0,1710,1712,
        5,140,0,0,1711,1710,1,0,0,0,1711,1712,1,0,0,0,1712,1713,1,0,0,0,
        1713,1715,5,4,0,0,1714,1716,5,140,0,0,1715,1714,1,0,0,0,1715,1716,
        1,0,0,0,1716,1717,1,0,0,0,1717,1719,3,178,89,0,1718,1720,5,140,0,
        0,1719,1718,1,0,0,0,1719,1720,1,0,0,0,1720,1721,1,0,0,0,1721,1722,
        5,6,0,0,1722,1724,1,0,0,0,1723,1667,1,0,0,0,1723,1681,1,0,0,0,1723,
        1695,1,0,0,0,1723,1709,1,0,0,0,1724,177,1,0,0,0,1725,1730,3,184,
        92,0,1726,1728,5,140,0,0,1727,1726,1,0,0,0,1727,1728,1,0,0,0,1728,
        1729,1,0,0,0,1729,1731,3,92,46,0,1730,1727,1,0,0,0,1730,1731,1,0,
        0,0,1731,179,1,0,0,0,1732,1733,3,104,52,0,1733,181,1,0,0,0,1734,
        1736,5,4,0,0,1735,1737,5,140,0,0,1736,1735,1,0,0,0,1736,1737,1,0,
        0,0,1737,1738,1,0,0,0,1738,1740,3,130,65,0,1739,1741,5,140,0,0,1740,
        1739,1,0,0,0,1740,1741,1,0,0,0,1741,1742,1,0,0,0,1742,1743,5,6,0,
        0,1743,183,1,0,0,0,1744,1745,3,204,102,0,1745,1746,5,140,0,0,1746,
        1747,5,93,0,0,1747,1748,5,140,0,0,1748,1749,3,130,65,0,1749,185,
        1,0,0,0,1750,1752,5,105,0,0,1751,1753,5,140,0,0,1752,1751,1,0,0,
        0,1752,1753,1,0,0,0,1753,1754,1,0,0,0,1754,1756,5,4,0,0,1755,1757,
        5,140,0,0,1756,1755,1,0,0,0,1756,1757,1,0,0,0,1757,1758,1,0,0,0,
        1758,1760,3,204,102,0,1759,1761,5,140,0,0,1760,1759,1,0,0,0,1760,
        1761,1,0,0,0,1761,1762,1,0,0,0,1762,1764,5,2,0,0,1763,1765,5,140,
        0,0,1764,1763,1,0,0,0,1764,1765,1,0,0,0,1765,1766,1,0,0,0,1766,1768,
        3,130,65,0,1767,1769,5,140,0,0,1768,1767,1,0,0,0,1768,1769,1,0,0,
        0,1769,1770,1,0,0,0,1770,1772,5,5,0,0,1771,1773,5,140,0,0,1772,1771,
        1,0,0,0,1772,1773,1,0,0,0,1773,1774,1,0,0,0,1774,1776,3,184,92,0,
        1775,1777,5,140,0,0,1776,1775,1,0,0,0,1776,1777,1,0,0,0,1777,1778,
        1,0,0,0,1778,1780,5,7,0,0,1779,1781,5,140,0,0,1780,1779,1,0,0,0,
        1780,1781,1,0,0,0,1781,1782,1,0,0,0,1782,1784,3,130,65,0,1783,1785,
        5,140,0,0,1784,1783,1,0,0,0,1784,1785,1,0,0,0,1785,1786,1,0,0,0,
        1786,1787,5,6,0,0,1787,187,1,0,0,0,1788,1790,3,190,95,0,1789,1791,
        5,140,0,0,1790,1789,1,0,0,0,1790,1791,1,0,0,0,1791,1792,1,0,0,0,
        1792,1794,5,4,0,0,1793,1795,5,140,0,0,1794,1793,1,0,0,0,1794,1795,
        1,0,0,0,1795,1800,1,0,0,0,1796,1798,5,74,0,0,1797,1799,5,140,0,0,
        1798,1797,1,0,0,0,1798,1799,1,0,0,0,1799,1801,1,0,0,0,1800,1796,
        1,0,0,0,1800,1801,1,0,0,0,1801,1819,1,0,0,0,1802,1804,3,130,65,0,
        1803,1805,5,140,0,0,1804,1803,1,0,0,0,1804,1805,1,0,0,0,1805,1816,
        1,0,0,0,1806,1808,5,5,0,0,1807,1809,5,140,0,0,1808,1807,1,0,0,0,
        1808,1809,1,0,0,0,1809,1810,1,0,0,0,1810,1812,3,130,65,0,1811,1813,
        5,140,0,0,1812,1811,1,0,0,0,1812,1813,1,0,0,0,1813,1815,1,0,0,0,
        1814,1806,1,0,0,0,1815,1818,1,0,0,0,1816,1814,1,0,0,0,1816,1817,
        1,0,0,0,1817,1820,1,0,0,0,1818,1816,1,0,0,0,1819,1802,1,0,0,0,1819,
        1820,1,0,0,0,1820,1821,1,0,0,0,1821,1822,5,6,0,0,1822,189,1,0,0,
        0,1823,1824,3,202,101,0,1824,1825,3,228,114,0,1825,191,1,0,0,0,1826,
        1828,5,106,0,0,1827,1829,5,140,0,0,1828,1827,1,0,0,0,1828,1829,1,
        0,0,0,1829,1830,1,0,0,0,1830,1832,5,8,0,0,1831,1833,5,140,0,0,1832,
        1831,1,0,0,0,1832,1833,1,0,0,0,1833,1850,1,0,0,0,1834,1851,3,26,
        13,0,1835,1837,3,38,19,0,1836,1838,5,140,0,0,1837,1836,1,0,0,0,1837,
        1838,1,0,0,0,1838,1840,1,0,0,0,1839,1835,1,0,0,0,1840,1841,1,0,0,
        0,1841,1839,1,0,0,0,1841,1842,1,0,0,0,1842,1851,1,0,0,0,1843,1848,
        3,94,47,0,1844,1846,5,140,0,0,1845,1844,1,0,0,0,1845,1846,1,0,0,
        0,1846,1847,1,0,0,0,1847,1849,3,92,46,0,1848,1845,1,0,0,0,1848,1849,
        1,0,0,0,1849,1851,1,0,0,0,1850,1834,1,0,0,0,1850,1839,1,0,0,0,1850,
        1843,1,0,0,0,1851,1853,1,0,0,0,1852,1854,5,140,0,0,1853,1852,1,0,
        0,0,1853,1854,1,0,0,0,1854,1855,1,0,0,0,1855,1856,5,9,0,0,1856,193,
        1,0,0,0,1857,1859,3,200,100,0,1858,1860,5,140,0,0,1859,1858,1,0,
        0,0,1859,1860,1,0,0,0,1860,1861,1,0,0,0,1861,1863,5,4,0,0,1862,1864,
        5,140,0,0,1863,1862,1,0,0,0,1863,1864,1,0,0,0,1864,1882,1,0,0,0,
        1865,1867,3,130,65,0,1866,1868,5,140,0,0,1867,1866,1,0,0,0,1867,
        1868,1,0,0,0,1868,1879,1,0,0,0,1869,1871,5,5,0,0,1870,1872,5,140,
        0,0,1871,1870,1,0,0,0,1871,1872,1,0,0,0,1872,1873,1,0,0,0,1873,1875,
        3,130,65,0,1874,1876,5,140,0,0,1875,1874,1,0,0,0,1875,1876,1,0,0,
        0,1876,1878,1,0,0,0,1877,1869,1,0,0,0,1878,1881,1,0,0,0,1879,1877,
        1,0,0,0,1879,1880,1,0,0,0,1880,1883,1,0,0,0,1881,1879,1,0,0,0,1882,
        1865,1,0,0,0,1882,1883,1,0,0,0,1883,1884,1,0,0,0,1884,1885,5,6,0,
        0,1885,195,1,0,0,0,1886,1887,3,200,100,0,1887,197,1,0,0,0,1888,1889,
        3,228,114,0,1889,199,1,0,0,0,1890,1891,3,202,101,0,1891,1892,3,228,
        114,0,1892,201,1,0,0,0,1893,1894,3,228,114,0,1894,1895,5,25,0,0,
        1895,1897,1,0,0,0,1896,1893,1,0,0,0,1897,1900,1,0,0,0,1898,1896,
        1,0,0,0,1898,1899,1,0,0,0,1899,203,1,0,0,0,1900,1898,1,0,0,0,1901,
        1902,3,228,114,0,1902,205,1,0,0,0,1903,1910,3,208,104,0,1904,1910,
        5,95,0,0,1905,1910,3,210,105,0,1906,1910,5,121,0,0,1907,1910,3,216,
        108,0,1908,1910,3,218,109,0,1909,1903,1,0,0,0,1909,1904,1,0,0,0,
        1909,1905,1,0,0,0,1909,1906,1,0,0,0,1909,1907,1,0,0,0,1909,1908,
        1,0,0,0,1910,207,1,0,0,0,1911,1912,7,4,0,0,1912,209,1,0,0,0,1913,
        1916,3,214,107,0,1914,1916,3,212,106,0,1915,1913,1,0,0,0,1915,1914,
        1,0,0,0,1916,211,1,0,0,0,1917,1918,7,5,0,0,1918,213,1,0,0,0,1919,
        1920,7,6,0,0,1920,215,1,0,0,0,1921,1923,5,12,0,0,1922,1924,5,140,
        0,0,1923,1922,1,0,0,0,1923,1924,1,0,0,0,1924,1942,1,0,0,0,1925,1927,
        3,130,65,0,1926,1928,5,140,0,0,1927,1926,1,0,0,0,1927,1928,1,0,0,
        0,1928,1939,1,0,0,0,1929,1931,5,5,0,0,1930,1932,5,140,0,0,1931,1930,
        1,0,0,0,1931,1932,1,0,0,0,1932,1933,1,0,0,0,1933,1935,3,130,65,0,
        1934,1936,5,140,0,0,1935,1934,1,0,0,0,1935,1936,1,0,0,0,1936,1938,
        1,0,0,0,1937,1929,1,0,0,0,1938,1941,1,0,0,0,1939,1937,1,0,0,0,1939,
        1940,1,0,0,0,1940,1943,1,0,0,0,1941,1939,1,0,0,0,1942,1925,1,0,0,
        0,1942,1943,1,0,0,0,1943,1944,1,0,0,0,1944,1945,5,13,0,0,1945,217,
        1,0,0,0,1946,1948,5,8,0,0,1947,1949,5,140,0,0,1948,1947,1,0,0,0,
        1948,1949,1,0,0,0,1949,1983,1,0,0,0,1950,1952,3,220,110,0,1951,1953,
        5,140,0,0,1952,1951,1,0,0,0,1952,1953,1,0,0,0,1953,1954,1,0,0,0,
        1954,1956,5,3,0,0,1955,1957,5,140,0,0,1956,1955,1,0,0,0,1956,1957,
        1,0,0,0,1957,1958,1,0,0,0,1958,1960,3,130,65,0,1959,1961,5,140,0,
        0,1960,1959,1,0,0,0,1960,1961,1,0,0,0,1961,1980,1,0,0,0,1962,1964,
        5,5,0,0,1963,1965,5,140,0,0,1964,1963,1,0,0,0,1964,1965,1,0,0,0,
        1965,1966,1,0,0,0,1966,1968,3,220,110,0,1967,1969,5,140,0,0,1968,
        1967,1,0,0,0,1968,1969,1,0,0,0,1969,1970,1,0,0,0,1970,1972,5,3,0,
        0,1971,1973,5,140,0,0,1972,1971,1,0,0,0,1972,1973,1,0,0,0,1973,1974,
        1,0,0,0,1974,1976,3,130,65,0,1975,1977,5,140,0,0,1976,1975,1,0,0,
        0,1976,1977,1,0,0,0,1977,1979,1,0,0,0,1978,1962,1,0,0,0,1979,1982,
        1,0,0,0,1980,1978,1,0,0,0,1980,1981,1,0,0,0,1981,1984,1,0,0,0,1982,
        1980,1,0,0,0,1983,1950,1,0,0,0,1983,1984,1,0,0,0,1984,1985,1,0,0,
        0,1985,1986,5,9,0,0,1986,219,1,0,0,0,1987,1988,3,224,112,0,1988,
        221,1,0,0,0,1989,1992,5,26,0,0,1990,1993,3,228,114,0,1991,1993,5,
        110,0,0,1992,1990,1,0,0,0,1992,1991,1,0,0,0,1993,223,1,0,0,0,1994,
        1997,3,228,114,0,1995,1997,3,226,113,0,1996,1994,1,0,0,0,1996,1995,
        1,0,0,0,1997,225,1,0,0,0,1998,1999,7,7,0,0,1999,227,1,0,0,0,2000,
        2001,7,8,0,0,2001,229,1,0,0,0,2002,2003,7,9,0,0,2003,231,1,0,0,0,
        2004,2005,7,10,0,0,2005,233,1,0,0,0,2006,2007,7,11,0,0,2007,235,
        1,0,0,0,369,237,244,248,252,257,260,263,269,273,282,288,296,300,
        304,308,312,316,319,325,329,333,337,345,349,353,357,361,369,373,
        377,381,389,393,397,401,409,413,417,421,425,431,435,439,443,448,
        452,462,470,474,479,484,492,500,504,509,514,524,528,533,540,545,
        548,552,556,560,566,570,575,580,584,587,589,593,597,602,606,611,
        615,626,633,642,656,660,664,672,676,681,684,690,694,698,704,708,
        712,715,719,729,736,749,753,759,763,767,772,777,781,787,791,797,
        801,807,811,815,819,823,827,832,839,843,848,855,861,866,872,875,
        881,883,887,891,896,900,903,910,917,920,926,929,935,939,943,947,
        951,956,961,965,970,973,982,991,996,1009,1012,1020,1024,1029,1034,
        1038,1043,1047,1051,1055,1059,1065,1070,1077,1081,1086,1090,1094,
        1096,1100,1102,1106,1108,1114,1120,1124,1127,1130,1134,1140,1144,
        1147,1150,1156,1159,1162,1166,1172,1175,1178,1182,1186,1190,1192,
        1196,1198,1201,1205,1207,1213,1217,1221,1225,1228,1233,1238,1243,
        1248,1254,1258,1260,1264,1268,1270,1272,1280,1285,1296,1306,1316,
        1321,1325,1332,1337,1342,1347,1352,1357,1362,1367,1370,1376,1378,
        1391,1394,1401,1415,1419,1423,1427,1431,1434,1436,1441,1445,1449,
        1453,1457,1461,1464,1466,1471,1475,1480,1486,1489,1493,1497,1500,
        1502,1506,1509,1517,1521,1524,1528,1537,1541,1545,1558,1562,1567,
        1571,1575,1580,1582,1585,1589,1592,1595,1601,1605,1609,1615,1619,
        1623,1626,1629,1635,1639,1643,1645,1649,1653,1655,1659,1663,1669,
        1673,1677,1683,1687,1691,1697,1701,1705,1711,1715,1719,1723,1727,
        1730,1736,1740,1752,1756,1760,1764,1768,1772,1776,1780,1784,1790,
        1794,1798,1800,1804,1808,1812,1816,1819,1828,1832,1837,1841,1845,
        1848,1850,1853,1859,1863,1867,1871,1875,1879,1882,1898,1909,1915,
        1923,1927,1931,1935,1939,1942,1948,1952,1956,1960,1964,1968,1972,
        1976,1980,1983,1992,1996
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
