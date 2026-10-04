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
            this.state = 333;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 21, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 262;
                this.match(CypherParser.CREATE);
                this.state = 263;
                this.match(CypherParser.SP);
                this.state = 264;
                this.oC_IndexQualifier();
                this.state = 265;
                this.match(CypherParser.SP);
                this.state = 266;
                this.match(CypherParser.INDEX);
                this.state = 268;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 267;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 270;
                this.match(CypherParser.FOR);
                this.state = 272;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 271;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 274;
                this.oC_IndexEntity();
                this.state = 276;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 275;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 278;
                this.match(CypherParser.ON);
                this.state = 280;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 279;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 282;
                this.oC_IndexProperties();
                this.state = 291;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 12, this.context) ) {
                case 1:
                    {
                    this.state = 284;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 283;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 286;
                    this.match(CypherParser.OPTIONS);
                    this.state = 288;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 287;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 290;
                    this.oC_MapLiteral();
                    }
                    break;
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 293;
                this.match(CypherParser.CREATE);
                this.state = 294;
                this.match(CypherParser.SP);
                this.state = 295;
                this.match(CypherParser.INDEX);
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
                this.match(CypherParser.FOR);
                this.state = 301;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 300;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 303;
                this.oC_IndexEntity();
                this.state = 305;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 304;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 307;
                this.match(CypherParser.ON);
                this.state = 309;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 308;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 311;
                this.oC_IndexProperties();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
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
                if (_la === 139) {
                    {
                    this.state = 316;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 319;
                this.match(CypherParser.ON);
                this.state = 321;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 320;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 323;
                this.match(CypherParser.T__1);
                this.state = 325;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 324;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 327;
                this.oC_LabelName();
                this.state = 329;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 328;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 331;
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
            this.state = 397;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 34, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 335;
                this.match(CypherParser.DROP);
                this.state = 336;
                this.match(CypherParser.SP);
                this.state = 337;
                this.oC_IndexQualifier();
                this.state = 338;
                this.match(CypherParser.SP);
                this.state = 339;
                this.match(CypherParser.INDEX);
                this.state = 341;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 340;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 343;
                this.match(CypherParser.FOR);
                this.state = 345;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 344;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 347;
                this.oC_IndexEntity();
                this.state = 349;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
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
                if (_la === 139) {
                    {
                    this.state = 352;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 355;
                this.oC_IndexProperties();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 357;
                this.match(CypherParser.DROP);
                this.state = 358;
                this.match(CypherParser.SP);
                this.state = 359;
                this.match(CypherParser.INDEX);
                this.state = 361;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
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
                if (_la === 139) {
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
                if (_la === 139) {
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
                if (_la === 139) {
                    {
                    this.state = 372;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 375;
                this.oC_IndexProperties();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
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
                if (_la === 139) {
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
                if (_la === 139) {
                    {
                    this.state = 384;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 387;
                this.match(CypherParser.T__1);
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
                this.oC_LabelName();
                this.state = 393;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 392;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 395;
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
            this.state = 399;
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
            this.state = 403;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 35, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 401;
                this.oC_NodePattern();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 402;
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
            this.state = 405;
            this.match(CypherParser.T__2);
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
            this.oC_Expression();
            this.state = 420;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 39, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
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
                    this.match(CypherParser.T__3);
                    this.state = 415;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 414;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 417;
                    this.oC_Expression();
                    }
                    }
                }
                this.state = 422;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 39, this.context);
            }
            this.state = 424;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 423;
                this.match(CypherParser.SP);
                }
            }

            this.state = 426;
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
            this.state = 428;
            this.match(CypherParser.CREATE);
            this.state = 429;
            this.match(CypherParser.SP);
            this.state = 430;
            this.match(CypherParser.CONSTRAINT);
            this.state = 431;
            this.match(CypherParser.SP);
            this.state = 432;
            this.match(CypherParser.ON);
            this.state = 434;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 433;
                this.match(CypherParser.SP);
                }
            }

            this.state = 436;
            this.oC_IndexEntity();
            this.state = 437;
            this.match(CypherParser.SP);
            this.state = 438;
            this.match(CypherParser.ASSERT);
            this.state = 439;
            this.match(CypherParser.SP);
            this.state = 440;
            this.oC_Expression();
            this.state = 451;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 44, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 442;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 441;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 444;
                    this.match(CypherParser.T__3);
                    this.state = 446;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 445;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 448;
                    this.oC_Expression();
                    }
                    }
                }
                this.state = 453;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 44, this.context);
            }
            this.state = 456;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 45, this.context) ) {
            case 1:
                {
                this.state = 454;
                this.match(CypherParser.SP);
                this.state = 455;
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
            this.state = 458;
            this.match(CypherParser.DROP);
            this.state = 459;
            this.match(CypherParser.SP);
            this.state = 460;
            this.match(CypherParser.CONSTRAINT);
            this.state = 461;
            this.match(CypherParser.SP);
            this.state = 462;
            this.match(CypherParser.ON);
            this.state = 464;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 463;
                this.match(CypherParser.SP);
                }
            }

            this.state = 466;
            this.oC_IndexEntity();
            this.state = 467;
            this.match(CypherParser.SP);
            this.state = 468;
            this.match(CypherParser.ASSERT);
            this.state = 469;
            this.match(CypherParser.SP);
            this.state = 470;
            this.oC_Expression();
            this.state = 481;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 49, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 472;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 471;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 474;
                    this.match(CypherParser.T__3);
                    this.state = 476;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 475;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 478;
                    this.oC_Expression();
                    }
                    }
                }
                this.state = 483;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 49, this.context);
            }
            this.state = 486;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 50, this.context) ) {
            case 1:
                {
                this.state = 484;
                this.match(CypherParser.SP);
                this.state = 485;
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
            this.state = 496;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 51, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 488;
                this.match(CypherParser.IS);
                this.state = 489;
                this.match(CypherParser.SP);
                this.state = 490;
                this.match(CypherParser.UNIQUE);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 491;
                this.match(CypherParser.IS);
                this.state = 492;
                this.match(CypherParser.SP);
                this.state = 493;
                this.match(CypherParser.NOT);
                this.state = 494;
                this.match(CypherParser.SP);
                this.state = 495;
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
            this.state = 498;
            this.oC_SingleQuery();
            this.state = 505;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 53, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 500;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 499;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 502;
                    this.oC_Union();
                    }
                    }
                }
                this.state = 507;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 53, this.context);
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
            this.state = 520;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 56, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 508;
                this.match(CypherParser.UNION);
                this.state = 509;
                this.match(CypherParser.SP);
                this.state = 510;
                this.match(CypherParser.ALL);
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
                this.oC_SingleQuery();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 515;
                this.match(CypherParser.UNION);
                this.state = 517;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 516;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 519;
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
            this.state = 524;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 57, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 522;
                this.oC_SinglePartQuery();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 523;
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
            this.state = 561;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 66, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 532;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (((((_la - 53)) & ~0x1F) === 0 && ((1 << (_la - 53)) & 131521) !== 0)) {
                    {
                    {
                    this.state = 526;
                    this.oC_ReadingClause();
                    this.state = 528;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 527;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 534;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 535;
                this.oC_Return();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 542;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 61, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 536;
                        this.oC_ReadingClause();
                        this.state = 538;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 537;
                            this.match(CypherParser.SP);
                            }
                        }

                        }
                        }
                    }
                    this.state = 544;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 61, this.context);
                }
                this.state = 545;
                this.oC_UpdatingClause();
                this.state = 552;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 63, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 547;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 546;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 549;
                        this.oC_UpdatingClause();
                        }
                        }
                    }
                    this.state = 554;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 63, this.context);
                }
                this.state = 559;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 65, this.context) ) {
                case 1:
                    {
                    this.state = 556;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 555;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 558;
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
            this.state = 585;
            this.errorHandler.sync(this);
            alternative = 1;
            do {
                switch (alternative) {
                case 1:
                    {
                    {
                    this.state = 569;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 68, this.context);
                    while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                        if (alternative === 1) {
                            {
                            {
                            this.state = 563;
                            this.oC_ReadingClause();
                            this.state = 565;
                            this.errorHandler.sync(this);
                            _la = this.tokenStream.LA(1);
                            if (_la === 139) {
                                {
                                this.state = 564;
                                this.match(CypherParser.SP);
                                }
                            }

                            }
                            }
                        }
                        this.state = 571;
                        this.errorHandler.sync(this);
                        alternative = this.interpreter.adaptivePredict(this.tokenStream, 68, this.context);
                    }
                    this.state = 578;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    while (((((_la - 58)) & ~0x1F) === 0 && ((1 << (_la - 58)) & 8097) !== 0)) {
                        {
                        {
                        this.state = 572;
                        this.oC_UpdatingClause();
                        this.state = 574;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 573;
                            this.match(CypherParser.SP);
                            }
                        }

                        }
                        }
                        this.state = 580;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                    }
                    this.state = 581;
                    this.oC_With();
                    this.state = 583;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 582;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 587;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 72, this.context);
            } while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER);
            this.state = 589;
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
            this.state = 598;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.CREATE:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 591;
                this.oC_Create();
                }
                break;
            case CypherParser.MERGE:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 592;
                this.oC_Merge();
                }
                break;
            case CypherParser.DETACH:
            case CypherParser.DELETE:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 593;
                this.oC_Delete();
                }
                break;
            case CypherParser.SET:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 594;
                this.oC_Set();
                }
                break;
            case CypherParser.REMOVE:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 595;
                this.oC_Remove();
                }
                break;
            case CypherParser.FOREACH:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 596;
                this.oC_Foreach();
                }
                break;
            case CypherParser.CALL:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 597;
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
            this.state = 605;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 74, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 600;
                this.oC_Match();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 601;
                this.oC_Unwind();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 602;
                this.oC_InQueryCall();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 603;
                this.oC_CallSubquery();
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 604;
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
            this.state = 607;
            this.match(CypherParser.LOAD);
            this.state = 608;
            this.match(CypherParser.SP);
            this.state = 609;
            this.match(CypherParser.CSV);
            this.state = 614;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 75, this.context) ) {
            case 1:
                {
                this.state = 610;
                this.match(CypherParser.SP);
                this.state = 611;
                this.match(CypherParser.WITH);
                this.state = 612;
                this.match(CypherParser.SP);
                this.state = 613;
                this.match(CypherParser.HEADERS);
                }
                break;
            }
            this.state = 616;
            this.match(CypherParser.SP);
            this.state = 617;
            this.match(CypherParser.FROM);
            this.state = 618;
            this.match(CypherParser.SP);
            this.state = 619;
            this.oC_Expression();
            this.state = 620;
            this.match(CypherParser.SP);
            this.state = 621;
            this.match(CypherParser.AS);
            this.state = 622;
            this.match(CypherParser.SP);
            this.state = 623;
            this.oC_Variable();
            this.state = 628;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 76, this.context) ) {
            case 1:
                {
                this.state = 624;
                this.match(CypherParser.SP);
                this.state = 625;
                this.match(CypherParser.FIELDTERMINATOR);
                this.state = 626;
                this.match(CypherParser.SP);
                this.state = 627;
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
            this.state = 630;
            this.match(CypherParser.FOREACH);
            this.state = 632;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 631;
                this.match(CypherParser.SP);
                }
            }

            this.state = 634;
            this.match(CypherParser.T__2);
            this.state = 636;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 635;
                this.match(CypherParser.SP);
                }
            }

            this.state = 638;
            this.oC_Variable();
            this.state = 639;
            this.match(CypherParser.SP);
            this.state = 640;
            this.match(CypherParser.IN);
            this.state = 641;
            this.match(CypherParser.SP);
            this.state = 642;
            this.oC_Expression();
            this.state = 644;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 643;
                this.match(CypherParser.SP);
                }
            }

            this.state = 646;
            this.match(CypherParser.T__5);
            this.state = 651;
            this.errorHandler.sync(this);
            alternative = 1;
            do {
                switch (alternative) {
                case 1:
                    {
                    {
                    this.state = 648;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 647;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 650;
                    this.oC_UpdatingClause();
                    }
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 653;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 81, this.context);
            } while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER);
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
            this.state = 660;
            this.match(CypherParser.CALL);
            this.state = 662;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 661;
                this.match(CypherParser.SP);
                }
            }

            this.state = 664;
            this.match(CypherParser.T__6);
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
            this.oC_RegularQuery();
            this.state = 670;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 669;
                this.match(CypherParser.SP);
                }
            }

            this.state = 672;
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
            this.state = 676;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 59) {
                {
                this.state = 674;
                this.match(CypherParser.OPTIONAL);
                this.state = 675;
                this.match(CypherParser.SP);
                }
            }

            this.state = 678;
            this.match(CypherParser.MATCH);
            this.state = 680;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 679;
                this.match(CypherParser.SP);
                }
            }

            this.state = 682;
            this.oC_Pattern();
            this.state = 687;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 89, this.context) ) {
            case 1:
                {
                this.state = 684;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 683;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 686;
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
            this.state = 689;
            this.match(CypherParser.UNWIND);
            this.state = 691;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 690;
                this.match(CypherParser.SP);
                }
            }

            this.state = 693;
            this.oC_Expression();
            this.state = 694;
            this.match(CypherParser.SP);
            this.state = 695;
            this.match(CypherParser.AS);
            this.state = 696;
            this.match(CypherParser.SP);
            this.state = 697;
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
            this.state = 699;
            this.match(CypherParser.MERGE);
            this.state = 701;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 700;
                this.match(CypherParser.SP);
                }
            }

            this.state = 703;
            this.oC_PatternPart();
            this.state = 708;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 92, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 704;
                    this.match(CypherParser.SP);
                    this.state = 705;
                    this.oC_MergeAction();
                    }
                    }
                }
                this.state = 710;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 92, this.context);
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
            this.state = 721;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 93, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 711;
                this.match(CypherParser.ON);
                this.state = 712;
                this.match(CypherParser.SP);
                this.state = 713;
                this.match(CypherParser.MATCH);
                this.state = 714;
                this.match(CypherParser.SP);
                this.state = 715;
                this.oC_Set();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 716;
                this.match(CypherParser.ON);
                this.state = 717;
                this.match(CypherParser.SP);
                this.state = 718;
                this.match(CypherParser.CREATE);
                this.state = 719;
                this.match(CypherParser.SP);
                this.state = 720;
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
            this.state = 723;
            this.match(CypherParser.CREATE);
            this.state = 725;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 724;
                this.match(CypherParser.SP);
                }
            }

            this.state = 727;
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
            this.state = 729;
            this.match(CypherParser.SET);
            this.state = 731;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 730;
                this.match(CypherParser.SP);
                }
            }

            this.state = 733;
            this.oC_SetItem();
            this.state = 744;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 98, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 735;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 734;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 737;
                    this.match(CypherParser.T__3);
                    this.state = 739;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 738;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 741;
                    this.oC_SetItem();
                    }
                    }
                }
                this.state = 746;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 98, this.context);
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
            this.state = 783;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 106, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 747;
                this.oC_PropertyExpression();
                this.state = 749;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 748;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 751;
                this.match(CypherParser.T__8);
                this.state = 753;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 752;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 755;
                this.oC_Expression();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 757;
                this.oC_Variable();
                this.state = 759;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 758;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 761;
                this.match(CypherParser.T__8);
                this.state = 763;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 762;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 765;
                this.oC_Expression();
                }
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                {
                this.state = 767;
                this.oC_Variable();
                this.state = 769;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 768;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 771;
                this.match(CypherParser.T__9);
                this.state = 773;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
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
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 777;
                this.oC_Variable();
                this.state = 779;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 778;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 781;
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
            this.state = 787;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 67) {
                {
                this.state = 785;
                this.match(CypherParser.DETACH);
                this.state = 786;
                this.match(CypherParser.SP);
                }
            }

            this.state = 789;
            this.match(CypherParser.DELETE);
            this.state = 791;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 790;
                this.match(CypherParser.SP);
                }
            }

            this.state = 793;
            this.oC_Expression();
            this.state = 804;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 111, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 795;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 794;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 797;
                    this.match(CypherParser.T__3);
                    this.state = 799;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 798;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 801;
                    this.oC_Expression();
                    }
                    }
                }
                this.state = 806;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 111, this.context);
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
            this.state = 807;
            this.match(CypherParser.REMOVE);
            this.state = 808;
            this.match(CypherParser.SP);
            this.state = 809;
            this.oC_RemoveItem();
            this.state = 820;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 114, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 811;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 810;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 813;
                    this.match(CypherParser.T__3);
                    this.state = 815;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 814;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 817;
                    this.oC_RemoveItem();
                    }
                    }
                }
                this.state = 822;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 114, this.context);
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
            this.state = 827;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 115, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 823;
                this.oC_Variable();
                this.state = 824;
                this.oC_NodeLabels();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 826;
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
            this.state = 829;
            this.match(CypherParser.CALL);
            this.state = 830;
            this.match(CypherParser.SP);
            this.state = 831;
            this.oC_ExplicitProcedureInvocation();
            this.state = 838;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 117, this.context) ) {
            case 1:
                {
                this.state = 833;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 832;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 835;
                this.match(CypherParser.YIELD);
                this.state = 836;
                this.match(CypherParser.SP);
                this.state = 837;
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
            this.state = 840;
            this.match(CypherParser.CALL);
            this.state = 841;
            this.match(CypherParser.SP);
            this.state = 844;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 118, this.context) ) {
            case 1:
                {
                this.state = 842;
                this.oC_ExplicitProcedureInvocation();
                }
                break;
            case 2:
                {
                this.state = 843;
                this.oC_ImplicitProcedureInvocation();
                }
                break;
            }
            this.state = 855;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 121, this.context) ) {
            case 1:
                {
                this.state = 847;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 846;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 849;
                this.match(CypherParser.YIELD);
                this.state = 850;
                this.match(CypherParser.SP);
                this.state = 853;
                this.errorHandler.sync(this);
                switch (this.tokenStream.LA(1)) {
                case CypherParser.T__10:
                    {
                    this.state = 851;
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
                    this.state = 852;
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
            this.state = 857;
            this.oC_YieldItem();
            this.state = 868;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 124, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 859;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 858;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 861;
                    this.match(CypherParser.T__3);
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
                    this.oC_YieldItem();
                    }
                    }
                }
                this.state = 870;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 124, this.context);
            }
            this.state = 875;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 126, this.context) ) {
            case 1:
                {
                this.state = 872;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 871;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 874;
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
            this.state = 882;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 127, this.context) ) {
            case 1:
                {
                this.state = 877;
                this.oC_ProcedureResultField();
                this.state = 878;
                this.match(CypherParser.SP);
                this.state = 879;
                this.match(CypherParser.AS);
                this.state = 880;
                this.match(CypherParser.SP);
                }
                break;
            }
            this.state = 884;
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
            this.state = 886;
            this.match(CypherParser.WITH);
            this.state = 887;
            this.oC_ProjectionBody();
            this.state = 892;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 129, this.context) ) {
            case 1:
                {
                this.state = 889;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 888;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 891;
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
            this.state = 894;
            this.match(CypherParser.RETURN);
            this.state = 895;
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
            this.state = 901;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 131, this.context) ) {
            case 1:
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
                this.match(CypherParser.DISTINCT);
                }
                break;
            }
            this.state = 903;
            this.match(CypherParser.SP);
            this.state = 904;
            this.oC_ProjectionItems();
            this.state = 907;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 132, this.context) ) {
            case 1:
                {
                this.state = 905;
                this.match(CypherParser.SP);
                this.state = 906;
                this.oC_Order();
                }
                break;
            }
            this.state = 911;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 133, this.context) ) {
            case 1:
                {
                this.state = 909;
                this.match(CypherParser.SP);
                this.state = 910;
                this.oC_Skip();
                }
                break;
            }
            this.state = 915;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 134, this.context) ) {
            case 1:
                {
                this.state = 913;
                this.match(CypherParser.SP);
                this.state = 914;
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
            this.state = 945;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.T__10:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 917;
                this.match(CypherParser.T__10);
                this.state = 928;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 137, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 919;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 918;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 921;
                        this.match(CypherParser.T__3);
                        this.state = 923;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 922;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 925;
                        this.oC_ProjectionItem();
                        }
                        }
                    }
                    this.state = 930;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 137, this.context);
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
                this.state = 931;
                this.oC_ProjectionItem();
                this.state = 942;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 140, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 933;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 932;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 935;
                        this.match(CypherParser.T__3);
                        this.state = 937;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 936;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 939;
                        this.oC_ProjectionItem();
                        }
                        }
                    }
                    this.state = 944;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 140, this.context);
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
            this.state = 954;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 142, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 947;
                this.oC_Expression();
                this.state = 948;
                this.match(CypherParser.SP);
                this.state = 949;
                this.match(CypherParser.AS);
                this.state = 950;
                this.match(CypherParser.SP);
                this.state = 951;
                this.oC_Variable();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 953;
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
            this.state = 956;
            this.match(CypherParser.ORDER);
            this.state = 957;
            this.match(CypherParser.SP);
            this.state = 958;
            this.match(CypherParser.BY);
            this.state = 959;
            this.match(CypherParser.SP);
            this.state = 960;
            this.oC_SortItem();
            this.state = 968;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 4) {
                {
                {
                this.state = 961;
                this.match(CypherParser.T__3);
                this.state = 963;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 962;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 965;
                this.oC_SortItem();
                }
                }
                this.state = 970;
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
            this.state = 971;
            this.match(CypherParser.L_SKIP);
            this.state = 972;
            this.match(CypherParser.SP);
            this.state = 973;
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
            this.state = 975;
            this.match(CypherParser.LIMIT);
            this.state = 976;
            this.match(CypherParser.SP);
            this.state = 977;
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
            this.state = 979;
            this.oC_Expression();
            this.state = 984;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 146, this.context) ) {
            case 1:
                {
                this.state = 981;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 980;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 983;
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
            this.state = 986;
            this.match(CypherParser.WHERE);
            this.state = 987;
            this.match(CypherParser.SP);
            this.state = 988;
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
            this.state = 990;
            this.oC_PatternPart();
            this.state = 1001;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 149, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
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
                    this.match(CypherParser.T__3);
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
                    this.oC_PatternPart();
                    }
                    }
                }
                this.state = 1003;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 149, this.context);
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
            this.state = 1015;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 152, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1004;
                this.oC_Variable();
                this.state = 1006;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1005;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1008;
                this.match(CypherParser.T__8);
                this.state = 1010;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1009;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1012;
                this.oC_AnonymousPatternPart();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1014;
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
            this.state = 1019;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.SHORTESTPATH:
            case CypherParser.ALLSHORTESTPATHS:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1017;
                this.oC_ShortestPathPattern();
                }
                break;
            case CypherParser.T__2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1018;
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
            this.state = 1021;
            _la = this.tokenStream.LA(1);
            if(!(_la === 84 || _la === 85)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            this.state = 1023;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1022;
                this.match(CypherParser.SP);
                }
            }

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

            this.state = 1029;
            this.oC_PatternElement();
            this.state = 1031;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1030;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1033;
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
            this.state = 1049;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 159, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1035;
                this.oC_NodePattern();
                this.state = 1042;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 158, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 1037;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1036;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1039;
                        this.oC_PatternElementChain();
                        }
                        }
                    }
                    this.state = 1044;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 158, this.context);
                }
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1045;
                this.match(CypherParser.T__2);
                this.state = 1046;
                this.oC_PatternElement();
                this.state = 1047;
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
            this.state = 1051;
            this.oC_NodePattern();
            this.state = 1056;
            this.errorHandler.sync(this);
            alternative = 1;
            do {
                switch (alternative) {
                case 1:
                    {
                    {
                    this.state = 1053;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1052;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1055;
                    this.oC_PatternElementChain();
                    }
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 1058;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 161, this.context);
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
            this.state = 1060;
            this.match(CypherParser.T__2);
            this.state = 1062;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1061;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1068;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 8392607) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 272371715) !== 0) || ((((_la - 132)) & ~0x1F) === 0 && ((1 << (_la - 132)) & 79) !== 0)) {
                {
                this.state = 1064;
                this.oC_Variable();
                this.state = 1066;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1065;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1074;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 2) {
                {
                this.state = 1070;
                this.oC_NodeLabels();
                this.state = 1072;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1071;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1080;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 7 || _la === 26) {
                {
                this.state = 1076;
                this.oC_Properties();
                this.state = 1078;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1077;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1082;
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
            this.state = 1084;
            this.oC_RelationshipPattern();
            this.state = 1086;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1085;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1088;
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
            this.state = 1154;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 186, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1090;
                this.oC_LeftArrowHead();
                this.state = 1092;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1091;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1094;
                this.oC_Dash();
                this.state = 1096;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 171, this.context) ) {
                case 1:
                    {
                    this.state = 1095;
                    this.match(CypherParser.SP);
                    }
                    break;
                }
                this.state = 1099;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 12) {
                    {
                    this.state = 1098;
                    this.oC_RelationshipDetail();
                    }
                }

                this.state = 1102;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1101;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1104;
                this.oC_Dash();
                this.state = 1106;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1105;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1108;
                this.oC_RightArrowHead();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1110;
                this.oC_LeftArrowHead();
                this.state = 1112;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1111;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1114;
                this.oC_Dash();
                this.state = 1116;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 176, this.context) ) {
                case 1:
                    {
                    this.state = 1115;
                    this.match(CypherParser.SP);
                    }
                    break;
                }
                this.state = 1119;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 12) {
                    {
                    this.state = 1118;
                    this.oC_RelationshipDetail();
                    }
                }

                this.state = 1122;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1121;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1124;
                this.oC_Dash();
                }
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                {
                this.state = 1126;
                this.oC_Dash();
                this.state = 1128;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 179, this.context) ) {
                case 1:
                    {
                    this.state = 1127;
                    this.match(CypherParser.SP);
                    }
                    break;
                }
                this.state = 1131;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 12) {
                    {
                    this.state = 1130;
                    this.oC_RelationshipDetail();
                    }
                }

                this.state = 1134;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1133;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1136;
                this.oC_Dash();
                this.state = 1138;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1137;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1140;
                this.oC_RightArrowHead();
                }
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 1142;
                this.oC_Dash();
                this.state = 1144;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 183, this.context) ) {
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
                if (_la === 139) {
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
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
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
            this.state = 1156;
            this.match(CypherParser.T__11);
            this.state = 1158;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1157;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1164;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 8392607) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 272371715) !== 0) || ((((_la - 132)) & ~0x1F) === 0 && ((1 << (_la - 132)) & 79) !== 0)) {
                {
                this.state = 1160;
                this.oC_Variable();
                this.state = 1162;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1161;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1170;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 2) {
                {
                this.state = 1166;
                this.oC_RelationshipTypes();
                this.state = 1168;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1167;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1173;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 11) {
                {
                this.state = 1172;
                this.oC_RangeLiteral();
                }
            }

            this.state = 1179;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 7 || _la === 26) {
                {
                this.state = 1175;
                this.oC_Properties();
                this.state = 1177;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1176;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1181;
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
            this.state = 1185;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.T__6:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1183;
                this.oC_MapLiteral();
                }
                break;
            case CypherParser.T__25:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1184;
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
            this.state = 1187;
            this.match(CypherParser.T__1);
            this.state = 1189;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1188;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1191;
            this.oC_RelTypeName();
            this.state = 1205;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 200, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1193;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1192;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1195;
                    this.match(CypherParser.T__5);
                    this.state = 1197;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 2) {
                        {
                        this.state = 1196;
                        this.match(CypherParser.T__1);
                        }
                    }

                    this.state = 1200;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1199;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1202;
                    this.oC_RelTypeName();
                    }
                    }
                }
                this.state = 1207;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 200, this.context);
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
            this.state = 1208;
            this.oC_NodeLabel();
            this.state = 1215;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 202, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1210;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1209;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1212;
                    this.oC_NodeLabel();
                    }
                    }
                }
                this.state = 1217;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 202, this.context);
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
            this.state = 1218;
            this.match(CypherParser.T__1);
            this.state = 1220;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1219;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1222;
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
            this.state = 1224;
            this.match(CypherParser.T__10);
            this.state = 1226;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1225;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1232;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 109)) & ~0x1F) === 0 && ((1 << (_la - 109)) & 7) !== 0)) {
                {
                this.state = 1228;
                this.oC_IntegerLiteral();
                this.state = 1230;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1229;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1244;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 14) {
                {
                this.state = 1234;
                this.match(CypherParser.T__13);
                this.state = 1236;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1235;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1242;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (((((_la - 109)) & ~0x1F) === 0 && ((1 << (_la - 109)) & 7) !== 0)) {
                    {
                    this.state = 1238;
                    this.oC_IntegerLiteral();
                    this.state = 1240;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1239;
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
            this.state = 1246;
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
            this.state = 1248;
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
            this.state = 1250;
            this.oC_Atom();
            this.state = 1255;
            this.errorHandler.sync(this);
            alternative = 1;
            do {
                switch (alternative) {
                case 1:
                    {
                    {
                    this.state = 1252;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1251;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1254;
                    this.oC_PropertyLookup();
                    }
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 1257;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 212, this.context);
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
            this.state = 1259;
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
            this.state = 1261;
            this.oC_XorExpression();
            this.state = 1268;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 213, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1262;
                    this.match(CypherParser.SP);
                    this.state = 1263;
                    this.match(CypherParser.OR);
                    this.state = 1264;
                    this.match(CypherParser.SP);
                    this.state = 1265;
                    this.oC_XorExpression();
                    }
                    }
                }
                this.state = 1270;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 213, this.context);
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
            this.state = 1271;
            this.oC_AndExpression();
            this.state = 1278;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 214, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1272;
                    this.match(CypherParser.SP);
                    this.state = 1273;
                    this.match(CypherParser.XOR);
                    this.state = 1274;
                    this.match(CypherParser.SP);
                    this.state = 1275;
                    this.oC_AndExpression();
                    }
                    }
                }
                this.state = 1280;
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
    public oC_AndExpression(): OC_AndExpressionContext {
        let localContext = new OC_AndExpressionContext(this.context, this.state);
        this.enterRule(localContext, 134, CypherParser.RULE_oC_AndExpression);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1281;
            this.oC_NotExpression();
            this.state = 1288;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 215, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1282;
                    this.match(CypherParser.SP);
                    this.state = 1283;
                    this.match(CypherParser.AND);
                    this.state = 1284;
                    this.match(CypherParser.SP);
                    this.state = 1285;
                    this.oC_NotExpression();
                    }
                    }
                }
                this.state = 1290;
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
    public oC_NotExpression(): OC_NotExpressionContext {
        let localContext = new OC_NotExpressionContext(this.context, this.state);
        this.enterRule(localContext, 136, CypherParser.RULE_oC_NotExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1297;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 89) {
                {
                {
                this.state = 1291;
                this.match(CypherParser.NOT);
                this.state = 1293;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1292;
                    this.match(CypherParser.SP);
                    }
                }

                }
                }
                this.state = 1299;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 1300;
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
            this.state = 1302;
            this.oC_StringListNullPredicateExpression();
            this.state = 1309;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 219, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
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
                    this.oC_PartialComparisonExpression();
                    }
                    }
                }
                this.state = 1311;
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
    public oC_PartialComparisonExpression(): OC_PartialComparisonExpressionContext {
        let localContext = new OC_PartialComparisonExpressionContext(this.context, this.state);
        this.enterRule(localContext, 140, CypherParser.RULE_oC_PartialComparisonExpression);
        let _la: number;
        try {
            this.state = 1342;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.T__8:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1312;
                this.match(CypherParser.T__8);
                this.state = 1314;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1313;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1316;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__14:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1317;
                this.match(CypherParser.T__14);
                this.state = 1319;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1318;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1321;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__15:
                this.enterOuterAlt(localContext, 3);
                {
                {
                this.state = 1322;
                this.match(CypherParser.T__15);
                this.state = 1324;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1323;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1326;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__16:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 1327;
                this.match(CypherParser.T__16);
                this.state = 1329;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1328;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1331;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__17:
                this.enterOuterAlt(localContext, 5);
                {
                {
                this.state = 1332;
                this.match(CypherParser.T__17);
                this.state = 1334;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1333;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1336;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__18:
                this.enterOuterAlt(localContext, 6);
                {
                {
                this.state = 1337;
                this.match(CypherParser.T__18);
                this.state = 1339;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1338;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1341;
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
            this.state = 1344;
            this.oC_AddOrSubtractExpression();
            this.state = 1350;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 228, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    this.state = 1348;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 227, this.context) ) {
                    case 1:
                        {
                        this.state = 1345;
                        this.oC_StringPredicateExpression();
                        }
                        break;
                    case 2:
                        {
                        this.state = 1346;
                        this.oC_ListPredicateExpression();
                        }
                        break;
                    case 3:
                        {
                        this.state = 1347;
                        this.oC_NullPredicateExpression();
                        }
                        break;
                    }
                    }
                }
                this.state = 1352;
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
    public oC_StringPredicateExpression(): OC_StringPredicateExpressionContext {
        let localContext = new OC_StringPredicateExpressionContext(this.context, this.state);
        this.enterRule(localContext, 144, CypherParser.RULE_oC_StringPredicateExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1363;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 229, this.context) ) {
            case 1:
                {
                {
                this.state = 1353;
                this.match(CypherParser.SP);
                this.state = 1354;
                this.match(CypherParser.STARTS);
                this.state = 1355;
                this.match(CypherParser.SP);
                this.state = 1356;
                this.match(CypherParser.WITH);
                }
                }
                break;
            case 2:
                {
                {
                this.state = 1357;
                this.match(CypherParser.SP);
                this.state = 1358;
                this.match(CypherParser.ENDS);
                this.state = 1359;
                this.match(CypherParser.SP);
                this.state = 1360;
                this.match(CypherParser.WITH);
                }
                }
                break;
            case 3:
                {
                {
                this.state = 1361;
                this.match(CypherParser.SP);
                this.state = 1362;
                this.match(CypherParser.CONTAINS);
                }
                }
                break;
            }
            this.state = 1366;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1365;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1368;
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
            this.state = 1370;
            this.match(CypherParser.SP);
            this.state = 1371;
            this.match(CypherParser.IN);
            this.state = 1373;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1372;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1375;
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
            this.state = 1387;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 232, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1377;
                this.match(CypherParser.SP);
                this.state = 1378;
                this.match(CypherParser.IS);
                this.state = 1379;
                this.match(CypherParser.SP);
                this.state = 1380;
                this.match(CypherParser.NULL);
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1381;
                this.match(CypherParser.SP);
                this.state = 1382;
                this.match(CypherParser.IS);
                this.state = 1383;
                this.match(CypherParser.SP);
                this.state = 1384;
                this.match(CypherParser.NOT);
                this.state = 1385;
                this.match(CypherParser.SP);
                this.state = 1386;
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
            this.state = 1389;
            this.oC_MultiplyDivideModuloExpression();
            this.state = 1408;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 238, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    this.state = 1406;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 237, this.context) ) {
                    case 1:
                        {
                        {
                        this.state = 1391;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1390;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1393;
                        this.match(CypherParser.T__19);
                        this.state = 1395;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1394;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1397;
                        this.oC_MultiplyDivideModuloExpression();
                        }
                        }
                        break;
                    case 2:
                        {
                        {
                        this.state = 1399;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1398;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1401;
                        this.match(CypherParser.T__20);
                        this.state = 1403;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1402;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1405;
                        this.oC_MultiplyDivideModuloExpression();
                        }
                        }
                        break;
                    }
                    }
                }
                this.state = 1410;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 238, this.context);
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
            this.state = 1411;
            this.oC_PowerOfExpression();
            this.state = 1438;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 246, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    this.state = 1436;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 245, this.context) ) {
                    case 1:
                        {
                        {
                        this.state = 1413;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1412;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1415;
                        this.match(CypherParser.T__10);
                        this.state = 1417;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1416;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1419;
                        this.oC_PowerOfExpression();
                        }
                        }
                        break;
                    case 2:
                        {
                        {
                        this.state = 1421;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1420;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1423;
                        this.match(CypherParser.T__21);
                        this.state = 1425;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1424;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1427;
                        this.oC_PowerOfExpression();
                        }
                        }
                        break;
                    case 3:
                        {
                        {
                        this.state = 1429;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1428;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1431;
                        this.match(CypherParser.T__22);
                        this.state = 1433;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1432;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1435;
                        this.oC_PowerOfExpression();
                        }
                        }
                        break;
                    }
                    }
                }
                this.state = 1440;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 246, this.context);
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
            this.state = 1441;
            this.oC_UnaryAddOrSubtractExpression();
            this.state = 1452;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 249, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
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
                    this.match(CypherParser.T__23);
                    this.state = 1447;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1446;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1449;
                    this.oC_UnaryAddOrSubtractExpression();
                    }
                    }
                }
                this.state = 1454;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 249, this.context);
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
            this.state = 1461;
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
                this.state = 1455;
                this.oC_NonArithmeticOperatorExpression();
                }
                break;
            case CypherParser.T__19:
            case CypherParser.T__20:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1456;
                _la = this.tokenStream.LA(1);
                if(!(_la === 20 || _la === 21)) {
                this.errorHandler.recoverInline(this);
                }
                else {
                    this.errorHandler.reportMatch(this);
                    this.consume();
                }
                this.state = 1458;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1457;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1460;
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
            this.state = 1463;
            this.oC_Atom();
            this.state = 1474;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 255, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    this.state = 1472;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 254, this.context) ) {
                    case 1:
                        {
                        {
                        this.state = 1465;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1464;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1467;
                        this.oC_ListOperatorExpression();
                        }
                        }
                        break;
                    case 2:
                        {
                        {
                        this.state = 1469;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1468;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1471;
                        this.oC_PropertyLookup();
                        }
                        }
                        break;
                    }
                    }
                }
                this.state = 1476;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 255, this.context);
            }
            this.state = 1481;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 257, this.context) ) {
            case 1:
                {
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
            this.state = 1496;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 260, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1483;
                this.match(CypherParser.T__11);
                this.state = 1484;
                this.oC_Expression();
                this.state = 1485;
                this.match(CypherParser.T__12);
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1487;
                this.match(CypherParser.T__11);
                this.state = 1489;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 70258824) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 8392671) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 536623139) !== 0) || ((((_la - 119)) & ~0x1F) === 0 && ((1 << (_la - 119)) & 647175) !== 0)) {
                    {
                    this.state = 1488;
                    this.oC_Expression();
                    }
                }

                this.state = 1491;
                this.match(CypherParser.T__13);
                this.state = 1493;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 70258824) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 8392671) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 536623139) !== 0) || ((((_la - 119)) & ~0x1F) === 0 && ((1 << (_la - 119)) & 647175) !== 0)) {
                    {
                    this.state = 1492;
                    this.oC_Expression();
                    }
                }

                this.state = 1495;
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
            this.state = 1498;
            this.match(CypherParser.T__24);
            this.state = 1500;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1499;
                this.match(CypherParser.SP);
                }
            }

            {
            this.state = 1502;
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
            this.state = 1530;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 265, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1504;
                this.oC_Literal();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1505;
                this.oC_Parameter();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1506;
                this.oC_CaseExpression();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 1507;
                this.match(CypherParser.COUNT);
                this.state = 1509;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1508;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1511;
                this.match(CypherParser.T__2);
                this.state = 1513;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1512;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1515;
                this.match(CypherParser.T__10);
                this.state = 1517;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1516;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1519;
                this.match(CypherParser.T__4);
                }
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 1520;
                this.oC_ListComprehension();
                }
                break;
            case 6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 1521;
                this.oC_PatternComprehension();
                }
                break;
            case 7:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 1522;
                this.oC_ReduceExpression();
                }
                break;
            case 8:
                this.enterOuterAlt(localContext, 8);
                {
                this.state = 1523;
                this.oC_ShortestPathPattern();
                }
                break;
            case 9:
                this.enterOuterAlt(localContext, 9);
                {
                this.state = 1524;
                this.oC_Quantifier();
                }
                break;
            case 10:
                this.enterOuterAlt(localContext, 10);
                {
                this.state = 1525;
                this.oC_PatternPredicate();
                }
                break;
            case 11:
                this.enterOuterAlt(localContext, 11);
                {
                this.state = 1526;
                this.oC_ParenthesizedExpression();
                }
                break;
            case 12:
                this.enterOuterAlt(localContext, 12);
                {
                this.state = 1527;
                this.oC_FunctionInvocation();
                }
                break;
            case 13:
                this.enterOuterAlt(localContext, 13);
                {
                this.state = 1528;
                this.oC_ExistentialSubquery();
                }
                break;
            case 14:
                this.enterOuterAlt(localContext, 14);
                {
                this.state = 1529;
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
            this.state = 1554;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 271, this.context) ) {
            case 1:
                {
                {
                this.state = 1532;
                this.match(CypherParser.CASE);
                this.state = 1537;
                this.errorHandler.sync(this);
                alternative = 1;
                do {
                    switch (alternative) {
                    case 1:
                        {
                        {
                        this.state = 1534;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1533;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1536;
                        this.oC_CaseAlternative();
                        }
                        }
                        break;
                    default:
                        throw new antlr.NoViableAltException(this);
                    }
                    this.state = 1539;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 267, this.context);
                } while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER);
                }
                }
                break;
            case 2:
                {
                {
                this.state = 1541;
                this.match(CypherParser.CASE);
                this.state = 1543;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1542;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1545;
                this.oC_Expression();
                this.state = 1550;
                this.errorHandler.sync(this);
                alternative = 1;
                do {
                    switch (alternative) {
                    case 1:
                        {
                        {
                        this.state = 1547;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 139) {
                            {
                            this.state = 1546;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1549;
                        this.oC_CaseAlternative();
                        }
                        }
                        break;
                    default:
                        throw new antlr.NoViableAltException(this);
                    }
                    this.state = 1552;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 270, this.context);
                } while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER);
                }
                }
                break;
            }
            this.state = 1564;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 274, this.context) ) {
            case 1:
                {
                this.state = 1557;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1556;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1559;
                this.match(CypherParser.ELSE);
                this.state = 1561;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1560;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1563;
                this.oC_Expression();
                }
                break;
            }
            this.state = 1567;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1566;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1569;
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
            this.state = 1571;
            this.match(CypherParser.WHEN);
            this.state = 1573;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1572;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1575;
            this.oC_Expression();
            this.state = 1577;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1576;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1579;
            this.match(CypherParser.THEN);
            this.state = 1581;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1580;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1583;
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
            this.state = 1585;
            this.match(CypherParser.T__11);
            this.state = 1587;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1586;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1589;
            this.oC_FilterExpression();
            this.state = 1598;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 282, this.context) ) {
            case 1:
                {
                this.state = 1591;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1590;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1593;
                this.match(CypherParser.T__5);
                this.state = 1595;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1594;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1597;
                this.oC_Expression();
                }
                break;
            }
            this.state = 1601;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1600;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1603;
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
            this.state = 1605;
            this.match(CypherParser.T__11);
            this.state = 1607;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1606;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1617;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 8392607) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 272371715) !== 0) || ((((_la - 132)) & ~0x1F) === 0 && ((1 << (_la - 132)) & 79) !== 0)) {
                {
                this.state = 1609;
                this.oC_Variable();
                this.state = 1611;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1610;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1613;
                this.match(CypherParser.T__8);
                this.state = 1615;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1614;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1619;
            this.oC_RelationshipsPattern();
            this.state = 1621;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1620;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1627;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 83) {
                {
                this.state = 1623;
                this.oC_Where();
                this.state = 1625;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1624;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1629;
            this.match(CypherParser.T__5);
            this.state = 1631;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1630;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1633;
            this.oC_Expression();
            this.state = 1635;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1634;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1637;
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
            this.state = 1695;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.ALL:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1639;
                this.match(CypherParser.ALL);
                this.state = 1641;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1640;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1643;
                this.match(CypherParser.T__2);
                this.state = 1645;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1644;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1647;
                this.oC_FilterExpression();
                this.state = 1649;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1648;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1651;
                this.match(CypherParser.T__4);
                }
                }
                break;
            case CypherParser.ANY:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1653;
                this.match(CypherParser.ANY);
                this.state = 1655;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1654;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1657;
                this.match(CypherParser.T__2);
                this.state = 1659;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1658;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1661;
                this.oC_FilterExpression();
                this.state = 1663;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1662;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1665;
                this.match(CypherParser.T__4);
                }
                }
                break;
            case CypherParser.NONE:
                this.enterOuterAlt(localContext, 3);
                {
                {
                this.state = 1667;
                this.match(CypherParser.NONE);
                this.state = 1669;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1668;
                    this.match(CypherParser.SP);
                    }
                }

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
                this.oC_FilterExpression();
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
                break;
            case CypherParser.SINGLE:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 1681;
                this.match(CypherParser.SINGLE);
                this.state = 1683;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1682;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1685;
                this.match(CypherParser.T__2);
                this.state = 1687;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
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
                if (_la === 139) {
                    {
                    this.state = 1690;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1693;
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
            this.state = 1697;
            this.oC_IdInColl();
            this.state = 1702;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 307, this.context) ) {
            case 1:
                {
                this.state = 1699;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1698;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1701;
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
            this.state = 1704;
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
            this.state = 1706;
            this.match(CypherParser.T__2);
            this.state = 1708;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1707;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1710;
            this.oC_Expression();
            this.state = 1712;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1711;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1714;
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
            this.state = 1716;
            this.oC_Variable();
            this.state = 1717;
            this.match(CypherParser.SP);
            this.state = 1718;
            this.match(CypherParser.IN);
            this.state = 1719;
            this.match(CypherParser.SP);
            this.state = 1720;
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
            this.state = 1722;
            this.match(CypherParser.REDUCE);
            this.state = 1724;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1723;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1726;
            this.match(CypherParser.T__2);
            this.state = 1728;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1727;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1730;
            this.oC_Variable();
            this.state = 1732;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1731;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1734;
            this.match(CypherParser.T__8);
            this.state = 1736;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
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
            if (_la === 139) {
                {
                this.state = 1739;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1742;
            this.match(CypherParser.T__3);
            this.state = 1744;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1743;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1746;
            this.oC_IdInColl();
            this.state = 1748;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1747;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1750;
            this.match(CypherParser.T__5);
            this.state = 1752;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1751;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1754;
            this.oC_Expression();
            this.state = 1756;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1755;
                this.match(CypherParser.SP);
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
    public oC_FunctionInvocation(): OC_FunctionInvocationContext {
        let localContext = new OC_FunctionInvocationContext(this.context, this.state);
        this.enterRule(localContext, 186, CypherParser.RULE_oC_FunctionInvocation);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1760;
            this.oC_FunctionName();
            this.state = 1762;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1761;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1764;
            this.match(CypherParser.T__2);
            this.state = 1766;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1765;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1772;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 74) {
                {
                this.state = 1768;
                this.match(CypherParser.DISTINCT);
                this.state = 1770;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1769;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1791;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 70258824) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 8392671) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 536623139) !== 0) || ((((_la - 119)) & ~0x1F) === 0 && ((1 << (_la - 119)) & 647175) !== 0)) {
                {
                this.state = 1774;
                this.oC_Expression();
                this.state = 1776;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1775;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1788;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 4) {
                    {
                    {
                    this.state = 1778;
                    this.match(CypherParser.T__3);
                    this.state = 1780;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
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
                    if (_la === 139) {
                        {
                        this.state = 1783;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 1790;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            this.state = 1793;
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
            this.state = 1795;
            this.oC_Namespace();
            this.state = 1796;
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
            this.state = 1798;
            this.match(CypherParser.EXISTS);
            this.state = 1800;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1799;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1802;
            this.match(CypherParser.T__6);
            this.state = 1804;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1803;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1822;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 334, this.context) ) {
            case 1:
                {
                this.state = 1806;
                this.oC_RegularQuery();
                }
                break;
            case 2:
                {
                {
                this.state = 1811;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                do {
                    {
                    {
                    this.state = 1807;
                    this.oC_ReadingClause();
                    this.state = 1809;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 330, this.context) ) {
                    case 1:
                        {
                        this.state = 1808;
                        this.match(CypherParser.SP);
                        }
                        break;
                    }
                    }
                    }
                    this.state = 1813;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                } while (((((_la - 53)) & ~0x1F) === 0 && ((1 << (_la - 53)) & 131521) !== 0));
                }
                }
                break;
            case 3:
                {
                {
                this.state = 1815;
                this.oC_Pattern();
                this.state = 1820;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 333, this.context) ) {
                case 1:
                    {
                    this.state = 1817;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1816;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1819;
                    this.oC_Where();
                    }
                    break;
                }
                }
                }
                break;
            }
            this.state = 1825;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1824;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1827;
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
            this.state = 1829;
            this.oC_ProcedureName();
            this.state = 1831;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1830;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1833;
            this.match(CypherParser.T__2);
            this.state = 1835;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1834;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1854;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 70258824) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 8392671) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 536623139) !== 0) || ((((_la - 119)) & ~0x1F) === 0 && ((1 << (_la - 119)) & 647175) !== 0)) {
                {
                this.state = 1837;
                this.oC_Expression();
                this.state = 1839;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1838;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1851;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 4) {
                    {
                    {
                    this.state = 1841;
                    this.match(CypherParser.T__3);
                    this.state = 1843;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1842;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1845;
                    this.oC_Expression();
                    this.state = 1847;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1846;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 1853;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            this.state = 1856;
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
            this.state = 1858;
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
            this.state = 1860;
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
            this.state = 1862;
            this.oC_Namespace();
            this.state = 1863;
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
            this.state = 1870;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 343, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1865;
                    this.oC_SymbolicName();
                    this.state = 1866;
                    this.match(CypherParser.T__24);
                    }
                    }
                }
                this.state = 1872;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 343, this.context);
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
            this.state = 1873;
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
            this.state = 1881;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.TRUE:
            case CypherParser.FALSE:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1875;
                this.oC_BooleanLiteral();
                }
                break;
            case CypherParser.NULL:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1876;
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
                this.state = 1877;
                this.oC_NumberLiteral();
                }
                break;
            case CypherParser.StringLiteral:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 1878;
                this.match(CypherParser.StringLiteral);
                }
                break;
            case CypherParser.T__11:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 1879;
                this.oC_ListLiteral();
                }
                break;
            case CypherParser.T__6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 1880;
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
            this.state = 1883;
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
            this.state = 1887;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.ExponentDecimalReal:
            case CypherParser.RegularDecimalReal:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1885;
                this.oC_DoubleLiteral();
                }
                break;
            case CypherParser.HexInteger:
            case CypherParser.DecimalInteger:
            case CypherParser.OctalInteger:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1886;
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
            this.state = 1889;
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
            this.state = 1891;
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
            this.state = 1893;
            this.match(CypherParser.T__11);
            this.state = 1895;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1894;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1914;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 70258824) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 8392671) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 536623139) !== 0) || ((((_la - 119)) & ~0x1F) === 0 && ((1 << (_la - 119)) & 647175) !== 0)) {
                {
                this.state = 1897;
                this.oC_Expression();
                this.state = 1899;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1898;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1911;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 4) {
                    {
                    {
                    this.state = 1901;
                    this.match(CypherParser.T__3);
                    this.state = 1903;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1902;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1905;
                    this.oC_Expression();
                    this.state = 1907;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1906;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 1913;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            this.state = 1916;
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
            this.state = 1918;
            this.match(CypherParser.T__6);
            this.state = 1920;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 139) {
                {
                this.state = 1919;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1955;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 4244635647) !== 0) || ((((_la - 78)) & ~0x1F) === 0 && ((1 << (_la - 78)) & 2147483647) !== 0) || ((((_la - 112)) & ~0x1F) === 0 && ((1 << (_la - 112)) & 83884033) !== 0)) {
                {
                this.state = 1922;
                this.oC_PropertyKeyName();
                this.state = 1924;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1923;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1926;
                this.match(CypherParser.T__1);
                this.state = 1928;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1927;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1930;
                this.oC_Expression();
                this.state = 1932;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 139) {
                    {
                    this.state = 1931;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1952;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 4) {
                    {
                    {
                    this.state = 1934;
                    this.match(CypherParser.T__3);
                    this.state = 1936;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1935;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1938;
                    this.oC_PropertyKeyName();
                    this.state = 1940;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1939;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1942;
                    this.match(CypherParser.T__1);
                    this.state = 1944;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1943;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1946;
                    this.oC_Expression();
                    this.state = 1948;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 139) {
                        {
                        this.state = 1947;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 1954;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            this.state = 1957;
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
            this.state = 1959;
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
            this.state = 1961;
            this.match(CypherParser.T__25);
            this.state = 1964;
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
                this.state = 1962;
                this.oC_SymbolicName();
                }
                break;
            case CypherParser.DecimalInteger:
                {
                this.state = 1963;
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
            this.state = 1968;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 363, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1966;
                this.oC_SymbolicName();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1967;
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
            this.state = 1970;
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
            this.state = 1972;
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
            this.state = 1974;
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
            this.state = 1976;
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
            this.state = 1978;
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
        4,1,141,1981,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,
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
        8,2,1,3,1,3,1,3,1,3,3,3,261,8,3,1,4,1,4,1,4,1,4,1,4,1,4,3,4,269,
        8,4,1,4,1,4,3,4,273,8,4,1,4,1,4,3,4,277,8,4,1,4,1,4,3,4,281,8,4,
        1,4,1,4,3,4,285,8,4,1,4,1,4,3,4,289,8,4,1,4,3,4,292,8,4,1,4,1,4,
        1,4,1,4,3,4,298,8,4,1,4,1,4,3,4,302,8,4,1,4,1,4,3,4,306,8,4,1,4,
        1,4,3,4,310,8,4,1,4,1,4,1,4,1,4,1,4,1,4,3,4,318,8,4,1,4,1,4,3,4,
        322,8,4,1,4,1,4,3,4,326,8,4,1,4,1,4,3,4,330,8,4,1,4,1,4,3,4,334,
        8,4,1,5,1,5,1,5,1,5,1,5,1,5,3,5,342,8,5,1,5,1,5,3,5,346,8,5,1,5,
        1,5,3,5,350,8,5,1,5,1,5,3,5,354,8,5,1,5,1,5,1,5,1,5,1,5,1,5,3,5,
        362,8,5,1,5,1,5,3,5,366,8,5,1,5,1,5,3,5,370,8,5,1,5,1,5,3,5,374,
        8,5,1,5,1,5,1,5,1,5,1,5,1,5,3,5,382,8,5,1,5,1,5,3,5,386,8,5,1,5,
        1,5,3,5,390,8,5,1,5,1,5,3,5,394,8,5,1,5,1,5,3,5,398,8,5,1,6,1,6,
        1,7,1,7,3,7,404,8,7,1,8,1,8,3,8,408,8,8,1,8,1,8,3,8,412,8,8,1,8,
        1,8,3,8,416,8,8,1,8,5,8,419,8,8,10,8,12,8,422,9,8,1,8,3,8,425,8,
        8,1,8,1,8,1,9,1,9,1,9,1,9,1,9,1,9,3,9,435,8,9,1,9,1,9,1,9,1,9,1,
        9,1,9,3,9,443,8,9,1,9,1,9,3,9,447,8,9,1,9,5,9,450,8,9,10,9,12,9,
        453,9,9,1,9,1,9,3,9,457,8,9,1,10,1,10,1,10,1,10,1,10,1,10,3,10,465,
        8,10,1,10,1,10,1,10,1,10,1,10,1,10,3,10,473,8,10,1,10,1,10,3,10,
        477,8,10,1,10,5,10,480,8,10,10,10,12,10,483,9,10,1,10,1,10,3,10,
        487,8,10,1,11,1,11,1,11,1,11,1,11,1,11,1,11,1,11,3,11,497,8,11,1,
        12,1,12,3,12,501,8,12,1,12,5,12,504,8,12,10,12,12,12,507,9,12,1,
        13,1,13,1,13,1,13,3,13,513,8,13,1,13,1,13,1,13,3,13,518,8,13,1,13,
        3,13,521,8,13,1,14,1,14,3,14,525,8,14,1,15,1,15,3,15,529,8,15,5,
        15,531,8,15,10,15,12,15,534,9,15,1,15,1,15,1,15,3,15,539,8,15,5,
        15,541,8,15,10,15,12,15,544,9,15,1,15,1,15,3,15,548,8,15,1,15,5,
        15,551,8,15,10,15,12,15,554,9,15,1,15,3,15,557,8,15,1,15,3,15,560,
        8,15,3,15,562,8,15,1,16,1,16,3,16,566,8,16,5,16,568,8,16,10,16,12,
        16,571,9,16,1,16,1,16,3,16,575,8,16,5,16,577,8,16,10,16,12,16,580,
        9,16,1,16,1,16,3,16,584,8,16,4,16,586,8,16,11,16,12,16,587,1,16,
        1,16,1,17,1,17,1,17,1,17,1,17,1,17,1,17,3,17,599,8,17,1,18,1,18,
        1,18,1,18,1,18,3,18,606,8,18,1,19,1,19,1,19,1,19,1,19,1,19,1,19,
        3,19,615,8,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,
        1,19,1,19,3,19,629,8,19,1,20,1,20,3,20,633,8,20,1,20,1,20,3,20,637,
        8,20,1,20,1,20,1,20,1,20,1,20,1,20,3,20,645,8,20,1,20,1,20,3,20,
        649,8,20,1,20,4,20,652,8,20,11,20,12,20,653,1,20,3,20,657,8,20,1,
        20,1,20,1,21,1,21,3,21,663,8,21,1,21,1,21,3,21,667,8,21,1,21,1,21,
        3,21,671,8,21,1,21,1,21,1,22,1,22,3,22,677,8,22,1,22,1,22,3,22,681,
        8,22,1,22,1,22,3,22,685,8,22,1,22,3,22,688,8,22,1,23,1,23,3,23,692,
        8,23,1,23,1,23,1,23,1,23,1,23,1,23,1,24,1,24,3,24,702,8,24,1,24,
        1,24,1,24,5,24,707,8,24,10,24,12,24,710,9,24,1,25,1,25,1,25,1,25,
        1,25,1,25,1,25,1,25,1,25,1,25,3,25,722,8,25,1,26,1,26,3,26,726,8,
        26,1,26,1,26,1,27,1,27,3,27,732,8,27,1,27,1,27,3,27,736,8,27,1,27,
        1,27,3,27,740,8,27,1,27,5,27,743,8,27,10,27,12,27,746,9,27,1,28,
        1,28,3,28,750,8,28,1,28,1,28,3,28,754,8,28,1,28,1,28,1,28,1,28,3,
        28,760,8,28,1,28,1,28,3,28,764,8,28,1,28,1,28,1,28,1,28,3,28,770,
        8,28,1,28,1,28,3,28,774,8,28,1,28,1,28,1,28,1,28,3,28,780,8,28,1,
        28,1,28,3,28,784,8,28,1,29,1,29,3,29,788,8,29,1,29,1,29,3,29,792,
        8,29,1,29,1,29,3,29,796,8,29,1,29,1,29,3,29,800,8,29,1,29,5,29,803,
        8,29,10,29,12,29,806,9,29,1,30,1,30,1,30,1,30,3,30,812,8,30,1,30,
        1,30,3,30,816,8,30,1,30,5,30,819,8,30,10,30,12,30,822,9,30,1,31,
        1,31,1,31,1,31,3,31,828,8,31,1,32,1,32,1,32,1,32,3,32,834,8,32,1,
        32,1,32,1,32,3,32,839,8,32,1,33,1,33,1,33,1,33,3,33,845,8,33,1,33,
        3,33,848,8,33,1,33,1,33,1,33,1,33,3,33,854,8,33,3,33,856,8,33,1,
        34,1,34,3,34,860,8,34,1,34,1,34,3,34,864,8,34,1,34,5,34,867,8,34,
        10,34,12,34,870,9,34,1,34,3,34,873,8,34,1,34,3,34,876,8,34,1,35,
        1,35,1,35,1,35,1,35,3,35,883,8,35,1,35,1,35,1,36,1,36,1,36,3,36,
        890,8,36,1,36,3,36,893,8,36,1,37,1,37,1,37,1,38,3,38,899,8,38,1,
        38,3,38,902,8,38,1,38,1,38,1,38,1,38,3,38,908,8,38,1,38,1,38,3,38,
        912,8,38,1,38,1,38,3,38,916,8,38,1,39,1,39,3,39,920,8,39,1,39,1,
        39,3,39,924,8,39,1,39,5,39,927,8,39,10,39,12,39,930,9,39,1,39,1,
        39,3,39,934,8,39,1,39,1,39,3,39,938,8,39,1,39,5,39,941,8,39,10,39,
        12,39,944,9,39,3,39,946,8,39,1,40,1,40,1,40,1,40,1,40,1,40,1,40,
        3,40,955,8,40,1,41,1,41,1,41,1,41,1,41,1,41,1,41,3,41,964,8,41,1,
        41,5,41,967,8,41,10,41,12,41,970,9,41,1,42,1,42,1,42,1,42,1,43,1,
        43,1,43,1,43,1,44,1,44,3,44,982,8,44,1,44,3,44,985,8,44,1,45,1,45,
        1,45,1,45,1,46,1,46,3,46,993,8,46,1,46,1,46,3,46,997,8,46,1,46,5,
        46,1000,8,46,10,46,12,46,1003,9,46,1,47,1,47,3,47,1007,8,47,1,47,
        1,47,3,47,1011,8,47,1,47,1,47,1,47,3,47,1016,8,47,1,48,1,48,3,48,
        1020,8,48,1,49,1,49,3,49,1024,8,49,1,49,1,49,3,49,1028,8,49,1,49,
        1,49,3,49,1032,8,49,1,49,1,49,1,50,1,50,3,50,1038,8,50,1,50,5,50,
        1041,8,50,10,50,12,50,1044,9,50,1,50,1,50,1,50,1,50,3,50,1050,8,
        50,1,51,1,51,3,51,1054,8,51,1,51,4,51,1057,8,51,11,51,12,51,1058,
        1,52,1,52,3,52,1063,8,52,1,52,1,52,3,52,1067,8,52,3,52,1069,8,52,
        1,52,1,52,3,52,1073,8,52,3,52,1075,8,52,1,52,1,52,3,52,1079,8,52,
        3,52,1081,8,52,1,52,1,52,1,53,1,53,3,53,1087,8,53,1,53,1,53,1,54,
        1,54,3,54,1093,8,54,1,54,1,54,3,54,1097,8,54,1,54,3,54,1100,8,54,
        1,54,3,54,1103,8,54,1,54,1,54,3,54,1107,8,54,1,54,1,54,1,54,1,54,
        3,54,1113,8,54,1,54,1,54,3,54,1117,8,54,1,54,3,54,1120,8,54,1,54,
        3,54,1123,8,54,1,54,1,54,1,54,1,54,3,54,1129,8,54,1,54,3,54,1132,
        8,54,1,54,3,54,1135,8,54,1,54,1,54,3,54,1139,8,54,1,54,1,54,1,54,
        1,54,3,54,1145,8,54,1,54,3,54,1148,8,54,1,54,3,54,1151,8,54,1,54,
        1,54,3,54,1155,8,54,1,55,1,55,3,55,1159,8,55,1,55,1,55,3,55,1163,
        8,55,3,55,1165,8,55,1,55,1,55,3,55,1169,8,55,3,55,1171,8,55,1,55,
        3,55,1174,8,55,1,55,1,55,3,55,1178,8,55,3,55,1180,8,55,1,55,1,55,
        1,56,1,56,3,56,1186,8,56,1,57,1,57,3,57,1190,8,57,1,57,1,57,3,57,
        1194,8,57,1,57,1,57,3,57,1198,8,57,1,57,3,57,1201,8,57,1,57,5,57,
        1204,8,57,10,57,12,57,1207,9,57,1,58,1,58,3,58,1211,8,58,1,58,5,
        58,1214,8,58,10,58,12,58,1217,9,58,1,59,1,59,3,59,1221,8,59,1,59,
        1,59,1,60,1,60,3,60,1227,8,60,1,60,1,60,3,60,1231,8,60,3,60,1233,
        8,60,1,60,1,60,3,60,1237,8,60,1,60,1,60,3,60,1241,8,60,3,60,1243,
        8,60,3,60,1245,8,60,1,61,1,61,1,62,1,62,1,63,1,63,3,63,1253,8,63,
        1,63,4,63,1256,8,63,11,63,12,63,1257,1,64,1,64,1,65,1,65,1,65,1,
        65,1,65,5,65,1267,8,65,10,65,12,65,1270,9,65,1,66,1,66,1,66,1,66,
        1,66,5,66,1277,8,66,10,66,12,66,1280,9,66,1,67,1,67,1,67,1,67,1,
        67,5,67,1287,8,67,10,67,12,67,1290,9,67,1,68,1,68,3,68,1294,8,68,
        5,68,1296,8,68,10,68,12,68,1299,9,68,1,68,1,68,1,69,1,69,3,69,1305,
        8,69,1,69,5,69,1308,8,69,10,69,12,69,1311,9,69,1,70,1,70,3,70,1315,
        8,70,1,70,1,70,1,70,3,70,1320,8,70,1,70,1,70,1,70,3,70,1325,8,70,
        1,70,1,70,1,70,3,70,1330,8,70,1,70,1,70,1,70,3,70,1335,8,70,1,70,
        1,70,1,70,3,70,1340,8,70,1,70,3,70,1343,8,70,1,71,1,71,1,71,1,71,
        5,71,1349,8,71,10,71,12,71,1352,9,71,1,72,1,72,1,72,1,72,1,72,1,
        72,1,72,1,72,1,72,1,72,3,72,1364,8,72,1,72,3,72,1367,8,72,1,72,1,
        72,1,73,1,73,1,73,3,73,1374,8,73,1,73,1,73,1,74,1,74,1,74,1,74,1,
        74,1,74,1,74,1,74,1,74,1,74,3,74,1388,8,74,1,75,1,75,3,75,1392,8,
        75,1,75,1,75,3,75,1396,8,75,1,75,1,75,3,75,1400,8,75,1,75,1,75,3,
        75,1404,8,75,1,75,5,75,1407,8,75,10,75,12,75,1410,9,75,1,76,1,76,
        3,76,1414,8,76,1,76,1,76,3,76,1418,8,76,1,76,1,76,3,76,1422,8,76,
        1,76,1,76,3,76,1426,8,76,1,76,1,76,3,76,1430,8,76,1,76,1,76,3,76,
        1434,8,76,1,76,5,76,1437,8,76,10,76,12,76,1440,9,76,1,77,1,77,3,
        77,1444,8,77,1,77,1,77,3,77,1448,8,77,1,77,5,77,1451,8,77,10,77,
        12,77,1454,9,77,1,78,1,78,1,78,3,78,1459,8,78,1,78,3,78,1462,8,78,
        1,79,1,79,3,79,1466,8,79,1,79,1,79,3,79,1470,8,79,1,79,5,79,1473,
        8,79,10,79,12,79,1476,9,79,1,79,3,79,1479,8,79,1,79,3,79,1482,8,
        79,1,80,1,80,1,80,1,80,1,80,1,80,3,80,1490,8,80,1,80,1,80,3,80,1494,
        8,80,1,80,3,80,1497,8,80,1,81,1,81,3,81,1501,8,81,1,81,1,81,1,82,
        1,82,1,82,1,82,1,82,3,82,1510,8,82,1,82,1,82,3,82,1514,8,82,1,82,
        1,82,3,82,1518,8,82,1,82,1,82,1,82,1,82,1,82,1,82,1,82,1,82,1,82,
        1,82,1,82,3,82,1531,8,82,1,83,1,83,3,83,1535,8,83,1,83,4,83,1538,
        8,83,11,83,12,83,1539,1,83,1,83,3,83,1544,8,83,1,83,1,83,3,83,1548,
        8,83,1,83,4,83,1551,8,83,11,83,12,83,1552,3,83,1555,8,83,1,83,3,
        83,1558,8,83,1,83,1,83,3,83,1562,8,83,1,83,3,83,1565,8,83,1,83,3,
        83,1568,8,83,1,83,1,83,1,84,1,84,3,84,1574,8,84,1,84,1,84,3,84,1578,
        8,84,1,84,1,84,3,84,1582,8,84,1,84,1,84,1,85,1,85,3,85,1588,8,85,
        1,85,1,85,3,85,1592,8,85,1,85,1,85,3,85,1596,8,85,1,85,3,85,1599,
        8,85,1,85,3,85,1602,8,85,1,85,1,85,1,86,1,86,3,86,1608,8,86,1,86,
        1,86,3,86,1612,8,86,1,86,1,86,3,86,1616,8,86,3,86,1618,8,86,1,86,
        1,86,3,86,1622,8,86,1,86,1,86,3,86,1626,8,86,3,86,1628,8,86,1,86,
        1,86,3,86,1632,8,86,1,86,1,86,3,86,1636,8,86,1,86,1,86,1,87,1,87,
        3,87,1642,8,87,1,87,1,87,3,87,1646,8,87,1,87,1,87,3,87,1650,8,87,
        1,87,1,87,1,87,1,87,3,87,1656,8,87,1,87,1,87,3,87,1660,8,87,1,87,
        1,87,3,87,1664,8,87,1,87,1,87,1,87,1,87,3,87,1670,8,87,1,87,1,87,
        3,87,1674,8,87,1,87,1,87,3,87,1678,8,87,1,87,1,87,1,87,1,87,3,87,
        1684,8,87,1,87,1,87,3,87,1688,8,87,1,87,1,87,3,87,1692,8,87,1,87,
        1,87,3,87,1696,8,87,1,88,1,88,3,88,1700,8,88,1,88,3,88,1703,8,88,
        1,89,1,89,1,90,1,90,3,90,1709,8,90,1,90,1,90,3,90,1713,8,90,1,90,
        1,90,1,91,1,91,1,91,1,91,1,91,1,91,1,92,1,92,3,92,1725,8,92,1,92,
        1,92,3,92,1729,8,92,1,92,1,92,3,92,1733,8,92,1,92,1,92,3,92,1737,
        8,92,1,92,1,92,3,92,1741,8,92,1,92,1,92,3,92,1745,8,92,1,92,1,92,
        3,92,1749,8,92,1,92,1,92,3,92,1753,8,92,1,92,1,92,3,92,1757,8,92,
        1,92,1,92,1,93,1,93,3,93,1763,8,93,1,93,1,93,3,93,1767,8,93,1,93,
        1,93,3,93,1771,8,93,3,93,1773,8,93,1,93,1,93,3,93,1777,8,93,1,93,
        1,93,3,93,1781,8,93,1,93,1,93,3,93,1785,8,93,5,93,1787,8,93,10,93,
        12,93,1790,9,93,3,93,1792,8,93,1,93,1,93,1,94,1,94,1,94,1,95,1,95,
        3,95,1801,8,95,1,95,1,95,3,95,1805,8,95,1,95,1,95,1,95,3,95,1810,
        8,95,4,95,1812,8,95,11,95,12,95,1813,1,95,1,95,3,95,1818,8,95,1,
        95,3,95,1821,8,95,3,95,1823,8,95,1,95,3,95,1826,8,95,1,95,1,95,1,
        96,1,96,3,96,1832,8,96,1,96,1,96,3,96,1836,8,96,1,96,1,96,3,96,1840,
        8,96,1,96,1,96,3,96,1844,8,96,1,96,1,96,3,96,1848,8,96,5,96,1850,
        8,96,10,96,12,96,1853,9,96,3,96,1855,8,96,1,96,1,96,1,97,1,97,1,
        98,1,98,1,99,1,99,1,99,1,100,1,100,1,100,5,100,1869,8,100,10,100,
        12,100,1872,9,100,1,101,1,101,1,102,1,102,1,102,1,102,1,102,1,102,
        3,102,1882,8,102,1,103,1,103,1,104,1,104,3,104,1888,8,104,1,105,
        1,105,1,106,1,106,1,107,1,107,3,107,1896,8,107,1,107,1,107,3,107,
        1900,8,107,1,107,1,107,3,107,1904,8,107,1,107,1,107,3,107,1908,8,
        107,5,107,1910,8,107,10,107,12,107,1913,9,107,3,107,1915,8,107,1,
        107,1,107,1,108,1,108,3,108,1921,8,108,1,108,1,108,3,108,1925,8,
        108,1,108,1,108,3,108,1929,8,108,1,108,1,108,3,108,1933,8,108,1,
        108,1,108,3,108,1937,8,108,1,108,1,108,3,108,1941,8,108,1,108,1,
        108,3,108,1945,8,108,1,108,1,108,3,108,1949,8,108,5,108,1951,8,108,
        10,108,12,108,1954,9,108,3,108,1956,8,108,1,108,1,108,1,109,1,109,
        1,110,1,110,1,110,3,110,1965,8,110,1,111,1,111,3,111,1969,8,111,
        1,112,1,112,1,113,1,113,1,114,1,114,1,115,1,115,1,116,1,116,1,116,
        0,0,117,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,
        42,44,46,48,50,52,54,56,58,60,62,64,66,68,70,72,74,76,78,80,82,84,
        86,88,90,92,94,96,98,100,102,104,106,108,110,112,114,116,118,120,
        122,124,126,128,130,132,134,136,138,140,142,144,146,148,150,152,
        154,156,158,160,162,164,166,168,170,172,174,176,178,180,182,184,
        186,188,190,192,194,196,198,200,202,204,206,208,210,212,214,216,
        218,220,222,224,226,228,230,232,0,12,1,0,48,49,1,0,79,82,1,0,84,
        85,1,0,20,21,1,0,107,108,1,0,109,111,1,0,119,120,7,0,51,52,58,69,
        72,83,86,95,97,101,106,108,123,132,9,0,46,50,53,57,69,69,84,85,96,
        96,102,105,112,112,132,135,138,138,2,0,16,16,27,30,2,0,17,17,31,
        34,2,0,21,21,35,45,2270,0,235,1,0,0,0,2,249,1,0,0,0,4,254,1,0,0,
        0,6,260,1,0,0,0,8,333,1,0,0,0,10,397,1,0,0,0,12,399,1,0,0,0,14,403,
        1,0,0,0,16,405,1,0,0,0,18,428,1,0,0,0,20,458,1,0,0,0,22,496,1,0,
        0,0,24,498,1,0,0,0,26,520,1,0,0,0,28,524,1,0,0,0,30,561,1,0,0,0,
        32,585,1,0,0,0,34,598,1,0,0,0,36,605,1,0,0,0,38,607,1,0,0,0,40,630,
        1,0,0,0,42,660,1,0,0,0,44,676,1,0,0,0,46,689,1,0,0,0,48,699,1,0,
        0,0,50,721,1,0,0,0,52,723,1,0,0,0,54,729,1,0,0,0,56,783,1,0,0,0,
        58,787,1,0,0,0,60,807,1,0,0,0,62,827,1,0,0,0,64,829,1,0,0,0,66,840,
        1,0,0,0,68,857,1,0,0,0,70,882,1,0,0,0,72,886,1,0,0,0,74,894,1,0,
        0,0,76,901,1,0,0,0,78,945,1,0,0,0,80,954,1,0,0,0,82,956,1,0,0,0,
        84,971,1,0,0,0,86,975,1,0,0,0,88,979,1,0,0,0,90,986,1,0,0,0,92,990,
        1,0,0,0,94,1015,1,0,0,0,96,1019,1,0,0,0,98,1021,1,0,0,0,100,1049,
        1,0,0,0,102,1051,1,0,0,0,104,1060,1,0,0,0,106,1084,1,0,0,0,108,1154,
        1,0,0,0,110,1156,1,0,0,0,112,1185,1,0,0,0,114,1187,1,0,0,0,116,1208,
        1,0,0,0,118,1218,1,0,0,0,120,1224,1,0,0,0,122,1246,1,0,0,0,124,1248,
        1,0,0,0,126,1250,1,0,0,0,128,1259,1,0,0,0,130,1261,1,0,0,0,132,1271,
        1,0,0,0,134,1281,1,0,0,0,136,1297,1,0,0,0,138,1302,1,0,0,0,140,1342,
        1,0,0,0,142,1344,1,0,0,0,144,1363,1,0,0,0,146,1370,1,0,0,0,148,1387,
        1,0,0,0,150,1389,1,0,0,0,152,1411,1,0,0,0,154,1441,1,0,0,0,156,1461,
        1,0,0,0,158,1463,1,0,0,0,160,1496,1,0,0,0,162,1498,1,0,0,0,164,1530,
        1,0,0,0,166,1554,1,0,0,0,168,1571,1,0,0,0,170,1585,1,0,0,0,172,1605,
        1,0,0,0,174,1695,1,0,0,0,176,1697,1,0,0,0,178,1704,1,0,0,0,180,1706,
        1,0,0,0,182,1716,1,0,0,0,184,1722,1,0,0,0,186,1760,1,0,0,0,188,1795,
        1,0,0,0,190,1798,1,0,0,0,192,1829,1,0,0,0,194,1858,1,0,0,0,196,1860,
        1,0,0,0,198,1862,1,0,0,0,200,1870,1,0,0,0,202,1873,1,0,0,0,204,1881,
        1,0,0,0,206,1883,1,0,0,0,208,1887,1,0,0,0,210,1889,1,0,0,0,212,1891,
        1,0,0,0,214,1893,1,0,0,0,216,1918,1,0,0,0,218,1959,1,0,0,0,220,1961,
        1,0,0,0,222,1968,1,0,0,0,224,1970,1,0,0,0,226,1972,1,0,0,0,228,1974,
        1,0,0,0,230,1976,1,0,0,0,232,1978,1,0,0,0,234,236,5,139,0,0,235,
        234,1,0,0,0,235,236,1,0,0,0,236,237,1,0,0,0,237,242,3,2,1,0,238,
        240,5,139,0,0,239,238,1,0,0,0,239,240,1,0,0,0,240,241,1,0,0,0,241,
        243,5,1,0,0,242,239,1,0,0,0,242,243,1,0,0,0,243,245,1,0,0,0,244,
        246,5,139,0,0,245,244,1,0,0,0,245,246,1,0,0,0,246,247,1,0,0,0,247,
        248,5,0,0,1,248,1,1,0,0,0,249,250,3,4,2,0,250,3,1,0,0,0,251,255,
        3,24,12,0,252,255,3,66,33,0,253,255,3,6,3,0,254,251,1,0,0,0,254,
        252,1,0,0,0,254,253,1,0,0,0,255,5,1,0,0,0,256,261,3,8,4,0,257,261,
        3,10,5,0,258,261,3,18,9,0,259,261,3,20,10,0,260,256,1,0,0,0,260,
        257,1,0,0,0,260,258,1,0,0,0,260,259,1,0,0,0,261,7,1,0,0,0,262,263,
        5,65,0,0,263,264,5,139,0,0,264,265,3,12,6,0,265,266,5,139,0,0,266,
        268,5,46,0,0,267,269,5,139,0,0,268,267,1,0,0,0,268,269,1,0,0,0,269,
        270,1,0,0,0,270,272,5,125,0,0,271,273,5,139,0,0,272,271,1,0,0,0,
        272,273,1,0,0,0,273,274,1,0,0,0,274,276,3,14,7,0,275,277,5,139,0,
        0,276,275,1,0,0,0,276,277,1,0,0,0,277,278,1,0,0,0,278,280,5,64,0,
        0,279,281,5,139,0,0,280,279,1,0,0,0,280,281,1,0,0,0,281,282,1,0,
        0,0,282,291,3,16,8,0,283,285,5,139,0,0,284,283,1,0,0,0,284,285,1,
        0,0,0,285,286,1,0,0,0,286,288,5,50,0,0,287,289,5,139,0,0,288,287,
        1,0,0,0,288,289,1,0,0,0,289,290,1,0,0,0,290,292,3,216,108,0,291,
        284,1,0,0,0,291,292,1,0,0,0,292,334,1,0,0,0,293,294,5,65,0,0,294,
        295,5,139,0,0,295,297,5,46,0,0,296,298,5,139,0,0,297,296,1,0,0,0,
        297,298,1,0,0,0,298,299,1,0,0,0,299,301,5,125,0,0,300,302,5,139,
        0,0,301,300,1,0,0,0,301,302,1,0,0,0,302,303,1,0,0,0,303,305,3,14,
        7,0,304,306,5,139,0,0,305,304,1,0,0,0,305,306,1,0,0,0,306,307,1,
        0,0,0,307,309,5,64,0,0,308,310,5,139,0,0,309,308,1,0,0,0,309,310,
        1,0,0,0,310,311,1,0,0,0,311,312,3,16,8,0,312,334,1,0,0,0,313,314,
        5,65,0,0,314,315,5,139,0,0,315,317,5,46,0,0,316,318,5,139,0,0,317,
        316,1,0,0,0,317,318,1,0,0,0,318,319,1,0,0,0,319,321,5,64,0,0,320,
        322,5,139,0,0,321,320,1,0,0,0,321,322,1,0,0,0,322,323,1,0,0,0,323,
        325,5,2,0,0,324,326,5,139,0,0,325,324,1,0,0,0,325,326,1,0,0,0,326,
        327,1,0,0,0,327,329,3,122,61,0,328,330,5,139,0,0,329,328,1,0,0,0,
        329,330,1,0,0,0,330,331,1,0,0,0,331,332,3,16,8,0,332,334,1,0,0,0,
        333,262,1,0,0,0,333,293,1,0,0,0,333,313,1,0,0,0,334,9,1,0,0,0,335,
        336,5,132,0,0,336,337,5,139,0,0,337,338,3,12,6,0,338,339,5,139,0,
        0,339,341,5,46,0,0,340,342,5,139,0,0,341,340,1,0,0,0,341,342,1,0,
        0,0,342,343,1,0,0,0,343,345,5,125,0,0,344,346,5,139,0,0,345,344,
        1,0,0,0,345,346,1,0,0,0,346,347,1,0,0,0,347,349,3,14,7,0,348,350,
        5,139,0,0,349,348,1,0,0,0,349,350,1,0,0,0,350,351,1,0,0,0,351,353,
        5,64,0,0,352,354,5,139,0,0,353,352,1,0,0,0,353,354,1,0,0,0,354,355,
        1,0,0,0,355,356,3,16,8,0,356,398,1,0,0,0,357,358,5,132,0,0,358,359,
        5,139,0,0,359,361,5,46,0,0,360,362,5,139,0,0,361,360,1,0,0,0,361,
        362,1,0,0,0,362,363,1,0,0,0,363,365,5,125,0,0,364,366,5,139,0,0,
        365,364,1,0,0,0,365,366,1,0,0,0,366,367,1,0,0,0,367,369,3,14,7,0,
        368,370,5,139,0,0,369,368,1,0,0,0,369,370,1,0,0,0,370,371,1,0,0,
        0,371,373,5,64,0,0,372,374,5,139,0,0,373,372,1,0,0,0,373,374,1,0,
        0,0,374,375,1,0,0,0,375,376,3,16,8,0,376,398,1,0,0,0,377,378,5,132,
        0,0,378,379,5,139,0,0,379,381,5,46,0,0,380,382,5,139,0,0,381,380,
        1,0,0,0,381,382,1,0,0,0,382,383,1,0,0,0,383,385,5,64,0,0,384,386,
        5,139,0,0,385,384,1,0,0,0,385,386,1,0,0,0,386,387,1,0,0,0,387,389,
        5,2,0,0,388,390,5,139,0,0,389,388,1,0,0,0,389,390,1,0,0,0,390,391,
        1,0,0,0,391,393,3,122,61,0,392,394,5,139,0,0,393,392,1,0,0,0,393,
        394,1,0,0,0,394,395,1,0,0,0,395,396,3,16,8,0,396,398,1,0,0,0,397,
        335,1,0,0,0,397,357,1,0,0,0,397,377,1,0,0,0,398,11,1,0,0,0,399,400,
        7,0,0,0,400,13,1,0,0,0,401,404,3,104,52,0,402,404,3,102,51,0,403,
        401,1,0,0,0,403,402,1,0,0,0,404,15,1,0,0,0,405,407,5,3,0,0,406,408,
        5,139,0,0,407,406,1,0,0,0,407,408,1,0,0,0,408,409,1,0,0,0,409,420,
        3,128,64,0,410,412,5,139,0,0,411,410,1,0,0,0,411,412,1,0,0,0,412,
        413,1,0,0,0,413,415,5,4,0,0,414,416,5,139,0,0,415,414,1,0,0,0,415,
        416,1,0,0,0,416,417,1,0,0,0,417,419,3,128,64,0,418,411,1,0,0,0,419,
        422,1,0,0,0,420,418,1,0,0,0,420,421,1,0,0,0,421,424,1,0,0,0,422,
        420,1,0,0,0,423,425,5,139,0,0,424,423,1,0,0,0,424,425,1,0,0,0,425,
        426,1,0,0,0,426,427,5,5,0,0,427,17,1,0,0,0,428,429,5,65,0,0,429,
        430,5,139,0,0,430,431,5,123,0,0,431,432,5,139,0,0,432,434,5,64,0,
        0,433,435,5,139,0,0,434,433,1,0,0,0,434,435,1,0,0,0,435,436,1,0,
        0,0,436,437,3,14,7,0,437,438,5,139,0,0,438,439,5,47,0,0,439,440,
        5,139,0,0,440,451,3,128,64,0,441,443,5,139,0,0,442,441,1,0,0,0,442,
        443,1,0,0,0,443,444,1,0,0,0,444,446,5,4,0,0,445,447,5,139,0,0,446,
        445,1,0,0,0,446,447,1,0,0,0,447,448,1,0,0,0,448,450,3,128,64,0,449,
        442,1,0,0,0,450,453,1,0,0,0,451,449,1,0,0,0,451,452,1,0,0,0,452,
        456,1,0,0,0,453,451,1,0,0,0,454,455,5,139,0,0,455,457,3,22,11,0,
        456,454,1,0,0,0,456,457,1,0,0,0,457,19,1,0,0,0,458,459,5,132,0,0,
        459,460,5,139,0,0,460,461,5,123,0,0,461,462,5,139,0,0,462,464,5,
        64,0,0,463,465,5,139,0,0,464,463,1,0,0,0,464,465,1,0,0,0,465,466,
        1,0,0,0,466,467,3,14,7,0,467,468,5,139,0,0,468,469,5,47,0,0,469,
        470,5,139,0,0,470,481,3,128,64,0,471,473,5,139,0,0,472,471,1,0,0,
        0,472,473,1,0,0,0,473,474,1,0,0,0,474,476,5,4,0,0,475,477,5,139,
        0,0,476,475,1,0,0,0,476,477,1,0,0,0,477,478,1,0,0,0,478,480,3,128,
        64,0,479,472,1,0,0,0,480,483,1,0,0,0,481,479,1,0,0,0,481,482,1,0,
        0,0,482,486,1,0,0,0,483,481,1,0,0,0,484,485,5,139,0,0,485,487,3,
        22,11,0,486,484,1,0,0,0,486,487,1,0,0,0,487,21,1,0,0,0,488,489,5,
        94,0,0,489,490,5,139,0,0,490,497,5,127,0,0,491,492,5,94,0,0,492,
        493,5,139,0,0,493,494,5,89,0,0,494,495,5,139,0,0,495,497,5,95,0,
        0,496,488,1,0,0,0,496,491,1,0,0,0,497,23,1,0,0,0,498,505,3,28,14,
        0,499,501,5,139,0,0,500,499,1,0,0,0,500,501,1,0,0,0,501,502,1,0,
        0,0,502,504,3,26,13,0,503,500,1,0,0,0,504,507,1,0,0,0,505,503,1,
        0,0,0,505,506,1,0,0,0,506,25,1,0,0,0,507,505,1,0,0,0,508,509,5,51,
        0,0,509,510,5,139,0,0,510,512,5,52,0,0,511,513,5,139,0,0,512,511,
        1,0,0,0,512,513,1,0,0,0,513,514,1,0,0,0,514,521,3,28,14,0,515,517,
        5,51,0,0,516,518,5,139,0,0,517,516,1,0,0,0,517,518,1,0,0,0,518,519,
        1,0,0,0,519,521,3,28,14,0,520,508,1,0,0,0,520,515,1,0,0,0,521,27,
        1,0,0,0,522,525,3,30,15,0,523,525,3,32,16,0,524,522,1,0,0,0,524,
        523,1,0,0,0,525,29,1,0,0,0,526,528,3,36,18,0,527,529,5,139,0,0,528,
        527,1,0,0,0,528,529,1,0,0,0,529,531,1,0,0,0,530,526,1,0,0,0,531,
        534,1,0,0,0,532,530,1,0,0,0,532,533,1,0,0,0,533,535,1,0,0,0,534,
        532,1,0,0,0,535,562,3,74,37,0,536,538,3,36,18,0,537,539,5,139,0,
        0,538,537,1,0,0,0,538,539,1,0,0,0,539,541,1,0,0,0,540,536,1,0,0,
        0,541,544,1,0,0,0,542,540,1,0,0,0,542,543,1,0,0,0,543,545,1,0,0,
        0,544,542,1,0,0,0,545,552,3,34,17,0,546,548,5,139,0,0,547,546,1,
        0,0,0,547,548,1,0,0,0,548,549,1,0,0,0,549,551,3,34,17,0,550,547,
        1,0,0,0,551,554,1,0,0,0,552,550,1,0,0,0,552,553,1,0,0,0,553,559,
        1,0,0,0,554,552,1,0,0,0,555,557,5,139,0,0,556,555,1,0,0,0,556,557,
        1,0,0,0,557,558,1,0,0,0,558,560,3,74,37,0,559,556,1,0,0,0,559,560,
        1,0,0,0,560,562,1,0,0,0,561,532,1,0,0,0,561,542,1,0,0,0,562,31,1,
        0,0,0,563,565,3,36,18,0,564,566,5,139,0,0,565,564,1,0,0,0,565,566,
        1,0,0,0,566,568,1,0,0,0,567,563,1,0,0,0,568,571,1,0,0,0,569,567,
        1,0,0,0,569,570,1,0,0,0,570,578,1,0,0,0,571,569,1,0,0,0,572,574,
        3,34,17,0,573,575,5,139,0,0,574,573,1,0,0,0,574,575,1,0,0,0,575,
        577,1,0,0,0,576,572,1,0,0,0,577,580,1,0,0,0,578,576,1,0,0,0,578,
        579,1,0,0,0,579,581,1,0,0,0,580,578,1,0,0,0,581,583,3,72,36,0,582,
        584,5,139,0,0,583,582,1,0,0,0,583,584,1,0,0,0,584,586,1,0,0,0,585,
        569,1,0,0,0,586,587,1,0,0,0,587,585,1,0,0,0,587,588,1,0,0,0,588,
        589,1,0,0,0,589,590,3,30,15,0,590,33,1,0,0,0,591,599,3,52,26,0,592,
        599,3,48,24,0,593,599,3,58,29,0,594,599,3,54,27,0,595,599,3,60,30,
        0,596,599,3,40,20,0,597,599,3,42,21,0,598,591,1,0,0,0,598,592,1,
        0,0,0,598,593,1,0,0,0,598,594,1,0,0,0,598,595,1,0,0,0,598,596,1,
        0,0,0,598,597,1,0,0,0,599,35,1,0,0,0,600,606,3,44,22,0,601,606,3,
        46,23,0,602,606,3,64,32,0,603,606,3,42,21,0,604,606,3,38,19,0,605,
        600,1,0,0,0,605,601,1,0,0,0,605,602,1,0,0,0,605,603,1,0,0,0,605,
        604,1,0,0,0,606,37,1,0,0,0,607,608,5,53,0,0,608,609,5,139,0,0,609,
        614,5,54,0,0,610,611,5,139,0,0,611,612,5,72,0,0,612,613,5,139,0,
        0,613,615,5,55,0,0,614,610,1,0,0,0,614,615,1,0,0,0,615,616,1,0,0,
        0,616,617,5,139,0,0,617,618,5,56,0,0,618,619,5,139,0,0,619,620,3,
        128,64,0,620,621,5,139,0,0,621,622,5,62,0,0,622,623,5,139,0,0,623,
        628,3,202,101,0,624,625,5,139,0,0,625,626,5,57,0,0,626,627,5,139,
        0,0,627,629,5,121,0,0,628,624,1,0,0,0,628,629,1,0,0,0,629,39,1,0,
        0,0,630,632,5,58,0,0,631,633,5,139,0,0,632,631,1,0,0,0,632,633,1,
        0,0,0,633,634,1,0,0,0,634,636,5,3,0,0,635,637,5,139,0,0,636,635,
        1,0,0,0,636,637,1,0,0,0,637,638,1,0,0,0,638,639,3,202,101,0,639,
        640,5,139,0,0,640,641,5,93,0,0,641,642,5,139,0,0,642,644,3,128,64,
        0,643,645,5,139,0,0,644,643,1,0,0,0,644,645,1,0,0,0,645,646,1,0,
        0,0,646,651,5,6,0,0,647,649,5,139,0,0,648,647,1,0,0,0,648,649,1,
        0,0,0,649,650,1,0,0,0,650,652,3,34,17,0,651,648,1,0,0,0,652,653,
        1,0,0,0,653,651,1,0,0,0,653,654,1,0,0,0,654,656,1,0,0,0,655,657,
        5,139,0,0,656,655,1,0,0,0,656,657,1,0,0,0,657,658,1,0,0,0,658,659,
        5,5,0,0,659,41,1,0,0,0,660,662,5,70,0,0,661,663,5,139,0,0,662,661,
        1,0,0,0,662,663,1,0,0,0,663,664,1,0,0,0,664,666,5,7,0,0,665,667,
        5,139,0,0,666,665,1,0,0,0,666,667,1,0,0,0,667,668,1,0,0,0,668,670,
        3,24,12,0,669,671,5,139,0,0,670,669,1,0,0,0,670,671,1,0,0,0,671,
        672,1,0,0,0,672,673,5,8,0,0,673,43,1,0,0,0,674,675,5,59,0,0,675,
        677,5,139,0,0,676,674,1,0,0,0,676,677,1,0,0,0,677,678,1,0,0,0,678,
        680,5,60,0,0,679,681,5,139,0,0,680,679,1,0,0,0,680,681,1,0,0,0,681,
        682,1,0,0,0,682,687,3,92,46,0,683,685,5,139,0,0,684,683,1,0,0,0,
        684,685,1,0,0,0,685,686,1,0,0,0,686,688,3,90,45,0,687,684,1,0,0,
        0,687,688,1,0,0,0,688,45,1,0,0,0,689,691,5,61,0,0,690,692,5,139,
        0,0,691,690,1,0,0,0,691,692,1,0,0,0,692,693,1,0,0,0,693,694,3,128,
        64,0,694,695,5,139,0,0,695,696,5,62,0,0,696,697,5,139,0,0,697,698,
        3,202,101,0,698,47,1,0,0,0,699,701,5,63,0,0,700,702,5,139,0,0,701,
        700,1,0,0,0,701,702,1,0,0,0,702,703,1,0,0,0,703,708,3,94,47,0,704,
        705,5,139,0,0,705,707,3,50,25,0,706,704,1,0,0,0,707,710,1,0,0,0,
        708,706,1,0,0,0,708,709,1,0,0,0,709,49,1,0,0,0,710,708,1,0,0,0,711,
        712,5,64,0,0,712,713,5,139,0,0,713,714,5,60,0,0,714,715,5,139,0,
        0,715,722,3,54,27,0,716,717,5,64,0,0,717,718,5,139,0,0,718,719,5,
        65,0,0,719,720,5,139,0,0,720,722,3,54,27,0,721,711,1,0,0,0,721,716,
        1,0,0,0,722,51,1,0,0,0,723,725,5,65,0,0,724,726,5,139,0,0,725,724,
        1,0,0,0,725,726,1,0,0,0,726,727,1,0,0,0,727,728,3,92,46,0,728,53,
        1,0,0,0,729,731,5,66,0,0,730,732,5,139,0,0,731,730,1,0,0,0,731,732,
        1,0,0,0,732,733,1,0,0,0,733,744,3,56,28,0,734,736,5,139,0,0,735,
        734,1,0,0,0,735,736,1,0,0,0,736,737,1,0,0,0,737,739,5,4,0,0,738,
        740,5,139,0,0,739,738,1,0,0,0,739,740,1,0,0,0,740,741,1,0,0,0,741,
        743,3,56,28,0,742,735,1,0,0,0,743,746,1,0,0,0,744,742,1,0,0,0,744,
        745,1,0,0,0,745,55,1,0,0,0,746,744,1,0,0,0,747,749,3,126,63,0,748,
        750,5,139,0,0,749,748,1,0,0,0,749,750,1,0,0,0,750,751,1,0,0,0,751,
        753,5,9,0,0,752,754,5,139,0,0,753,752,1,0,0,0,753,754,1,0,0,0,754,
        755,1,0,0,0,755,756,3,128,64,0,756,784,1,0,0,0,757,759,3,202,101,
        0,758,760,5,139,0,0,759,758,1,0,0,0,759,760,1,0,0,0,760,761,1,0,
        0,0,761,763,5,9,0,0,762,764,5,139,0,0,763,762,1,0,0,0,763,764,1,
        0,0,0,764,765,1,0,0,0,765,766,3,128,64,0,766,784,1,0,0,0,767,769,
        3,202,101,0,768,770,5,139,0,0,769,768,1,0,0,0,769,770,1,0,0,0,770,
        771,1,0,0,0,771,773,5,10,0,0,772,774,5,139,0,0,773,772,1,0,0,0,773,
        774,1,0,0,0,774,775,1,0,0,0,775,776,3,128,64,0,776,784,1,0,0,0,777,
        779,3,202,101,0,778,780,5,139,0,0,779,778,1,0,0,0,779,780,1,0,0,
        0,780,781,1,0,0,0,781,782,3,116,58,0,782,784,1,0,0,0,783,747,1,0,
        0,0,783,757,1,0,0,0,783,767,1,0,0,0,783,777,1,0,0,0,784,57,1,0,0,
        0,785,786,5,67,0,0,786,788,5,139,0,0,787,785,1,0,0,0,787,788,1,0,
        0,0,788,789,1,0,0,0,789,791,5,68,0,0,790,792,5,139,0,0,791,790,1,
        0,0,0,791,792,1,0,0,0,792,793,1,0,0,0,793,804,3,128,64,0,794,796,
        5,139,0,0,795,794,1,0,0,0,795,796,1,0,0,0,796,797,1,0,0,0,797,799,
        5,4,0,0,798,800,5,139,0,0,799,798,1,0,0,0,799,800,1,0,0,0,800,801,
        1,0,0,0,801,803,3,128,64,0,802,795,1,0,0,0,803,806,1,0,0,0,804,802,
        1,0,0,0,804,805,1,0,0,0,805,59,1,0,0,0,806,804,1,0,0,0,807,808,5,
        69,0,0,808,809,5,139,0,0,809,820,3,62,31,0,810,812,5,139,0,0,811,
        810,1,0,0,0,811,812,1,0,0,0,812,813,1,0,0,0,813,815,5,4,0,0,814,
        816,5,139,0,0,815,814,1,0,0,0,815,816,1,0,0,0,816,817,1,0,0,0,817,
        819,3,62,31,0,818,811,1,0,0,0,819,822,1,0,0,0,820,818,1,0,0,0,820,
        821,1,0,0,0,821,61,1,0,0,0,822,820,1,0,0,0,823,824,3,202,101,0,824,
        825,3,116,58,0,825,828,1,0,0,0,826,828,3,126,63,0,827,823,1,0,0,
        0,827,826,1,0,0,0,828,63,1,0,0,0,829,830,5,70,0,0,830,831,5,139,
        0,0,831,838,3,192,96,0,832,834,5,139,0,0,833,832,1,0,0,0,833,834,
        1,0,0,0,834,835,1,0,0,0,835,836,5,71,0,0,836,837,5,139,0,0,837,839,
        3,68,34,0,838,833,1,0,0,0,838,839,1,0,0,0,839,65,1,0,0,0,840,841,
        5,70,0,0,841,844,5,139,0,0,842,845,3,192,96,0,843,845,3,194,97,0,
        844,842,1,0,0,0,844,843,1,0,0,0,845,855,1,0,0,0,846,848,5,139,0,
        0,847,846,1,0,0,0,847,848,1,0,0,0,848,849,1,0,0,0,849,850,5,71,0,
        0,850,853,5,139,0,0,851,854,5,11,0,0,852,854,3,68,34,0,853,851,1,
        0,0,0,853,852,1,0,0,0,854,856,1,0,0,0,855,847,1,0,0,0,855,856,1,
        0,0,0,856,67,1,0,0,0,857,868,3,70,35,0,858,860,5,139,0,0,859,858,
        1,0,0,0,859,860,1,0,0,0,860,861,1,0,0,0,861,863,5,4,0,0,862,864,
        5,139,0,0,863,862,1,0,0,0,863,864,1,0,0,0,864,865,1,0,0,0,865,867,
        3,70,35,0,866,859,1,0,0,0,867,870,1,0,0,0,868,866,1,0,0,0,868,869,
        1,0,0,0,869,875,1,0,0,0,870,868,1,0,0,0,871,873,5,139,0,0,872,871,
        1,0,0,0,872,873,1,0,0,0,873,874,1,0,0,0,874,876,3,90,45,0,875,872,
        1,0,0,0,875,876,1,0,0,0,876,69,1,0,0,0,877,878,3,196,98,0,878,879,
        5,139,0,0,879,880,5,62,0,0,880,881,5,139,0,0,881,883,1,0,0,0,882,
        877,1,0,0,0,882,883,1,0,0,0,883,884,1,0,0,0,884,885,3,202,101,0,
        885,71,1,0,0,0,886,887,5,72,0,0,887,892,3,76,38,0,888,890,5,139,
        0,0,889,888,1,0,0,0,889,890,1,0,0,0,890,891,1,0,0,0,891,893,3,90,
        45,0,892,889,1,0,0,0,892,893,1,0,0,0,893,73,1,0,0,0,894,895,5,73,
        0,0,895,896,3,76,38,0,896,75,1,0,0,0,897,899,5,139,0,0,898,897,1,
        0,0,0,898,899,1,0,0,0,899,900,1,0,0,0,900,902,5,74,0,0,901,898,1,
        0,0,0,901,902,1,0,0,0,902,903,1,0,0,0,903,904,5,139,0,0,904,907,
        3,78,39,0,905,906,5,139,0,0,906,908,3,82,41,0,907,905,1,0,0,0,907,
        908,1,0,0,0,908,911,1,0,0,0,909,910,5,139,0,0,910,912,3,84,42,0,
        911,909,1,0,0,0,911,912,1,0,0,0,912,915,1,0,0,0,913,914,5,139,0,
        0,914,916,3,86,43,0,915,913,1,0,0,0,915,916,1,0,0,0,916,77,1,0,0,
        0,917,928,5,11,0,0,918,920,5,139,0,0,919,918,1,0,0,0,919,920,1,0,
        0,0,920,921,1,0,0,0,921,923,5,4,0,0,922,924,5,139,0,0,923,922,1,
        0,0,0,923,924,1,0,0,0,924,925,1,0,0,0,925,927,3,80,40,0,926,919,
        1,0,0,0,927,930,1,0,0,0,928,926,1,0,0,0,928,929,1,0,0,0,929,946,
        1,0,0,0,930,928,1,0,0,0,931,942,3,80,40,0,932,934,5,139,0,0,933,
        932,1,0,0,0,933,934,1,0,0,0,934,935,1,0,0,0,935,937,5,4,0,0,936,
        938,5,139,0,0,937,936,1,0,0,0,937,938,1,0,0,0,938,939,1,0,0,0,939,
        941,3,80,40,0,940,933,1,0,0,0,941,944,1,0,0,0,942,940,1,0,0,0,942,
        943,1,0,0,0,943,946,1,0,0,0,944,942,1,0,0,0,945,917,1,0,0,0,945,
        931,1,0,0,0,946,79,1,0,0,0,947,948,3,128,64,0,948,949,5,139,0,0,
        949,950,5,62,0,0,950,951,5,139,0,0,951,952,3,202,101,0,952,955,1,
        0,0,0,953,955,3,128,64,0,954,947,1,0,0,0,954,953,1,0,0,0,955,81,
        1,0,0,0,956,957,5,75,0,0,957,958,5,139,0,0,958,959,5,76,0,0,959,
        960,5,139,0,0,960,968,3,88,44,0,961,963,5,4,0,0,962,964,5,139,0,
        0,963,962,1,0,0,0,963,964,1,0,0,0,964,965,1,0,0,0,965,967,3,88,44,
        0,966,961,1,0,0,0,967,970,1,0,0,0,968,966,1,0,0,0,968,969,1,0,0,
        0,969,83,1,0,0,0,970,968,1,0,0,0,971,972,5,77,0,0,972,973,5,139,
        0,0,973,974,3,128,64,0,974,85,1,0,0,0,975,976,5,78,0,0,976,977,5,
        139,0,0,977,978,3,128,64,0,978,87,1,0,0,0,979,984,3,128,64,0,980,
        982,5,139,0,0,981,980,1,0,0,0,981,982,1,0,0,0,982,983,1,0,0,0,983,
        985,7,1,0,0,984,981,1,0,0,0,984,985,1,0,0,0,985,89,1,0,0,0,986,987,
        5,83,0,0,987,988,5,139,0,0,988,989,3,128,64,0,989,91,1,0,0,0,990,
        1001,3,94,47,0,991,993,5,139,0,0,992,991,1,0,0,0,992,993,1,0,0,0,
        993,994,1,0,0,0,994,996,5,4,0,0,995,997,5,139,0,0,996,995,1,0,0,
        0,996,997,1,0,0,0,997,998,1,0,0,0,998,1000,3,94,47,0,999,992,1,0,
        0,0,1000,1003,1,0,0,0,1001,999,1,0,0,0,1001,1002,1,0,0,0,1002,93,
        1,0,0,0,1003,1001,1,0,0,0,1004,1006,3,202,101,0,1005,1007,5,139,
        0,0,1006,1005,1,0,0,0,1006,1007,1,0,0,0,1007,1008,1,0,0,0,1008,1010,
        5,9,0,0,1009,1011,5,139,0,0,1010,1009,1,0,0,0,1010,1011,1,0,0,0,
        1011,1012,1,0,0,0,1012,1013,3,96,48,0,1013,1016,1,0,0,0,1014,1016,
        3,96,48,0,1015,1004,1,0,0,0,1015,1014,1,0,0,0,1016,95,1,0,0,0,1017,
        1020,3,98,49,0,1018,1020,3,100,50,0,1019,1017,1,0,0,0,1019,1018,
        1,0,0,0,1020,97,1,0,0,0,1021,1023,7,2,0,0,1022,1024,5,139,0,0,1023,
        1022,1,0,0,0,1023,1024,1,0,0,0,1024,1025,1,0,0,0,1025,1027,5,3,0,
        0,1026,1028,5,139,0,0,1027,1026,1,0,0,0,1027,1028,1,0,0,0,1028,1029,
        1,0,0,0,1029,1031,3,100,50,0,1030,1032,5,139,0,0,1031,1030,1,0,0,
        0,1031,1032,1,0,0,0,1032,1033,1,0,0,0,1033,1034,5,5,0,0,1034,99,
        1,0,0,0,1035,1042,3,104,52,0,1036,1038,5,139,0,0,1037,1036,1,0,0,
        0,1037,1038,1,0,0,0,1038,1039,1,0,0,0,1039,1041,3,106,53,0,1040,
        1037,1,0,0,0,1041,1044,1,0,0,0,1042,1040,1,0,0,0,1042,1043,1,0,0,
        0,1043,1050,1,0,0,0,1044,1042,1,0,0,0,1045,1046,5,3,0,0,1046,1047,
        3,100,50,0,1047,1048,5,5,0,0,1048,1050,1,0,0,0,1049,1035,1,0,0,0,
        1049,1045,1,0,0,0,1050,101,1,0,0,0,1051,1056,3,104,52,0,1052,1054,
        5,139,0,0,1053,1052,1,0,0,0,1053,1054,1,0,0,0,1054,1055,1,0,0,0,
        1055,1057,3,106,53,0,1056,1053,1,0,0,0,1057,1058,1,0,0,0,1058,1056,
        1,0,0,0,1058,1059,1,0,0,0,1059,103,1,0,0,0,1060,1062,5,3,0,0,1061,
        1063,5,139,0,0,1062,1061,1,0,0,0,1062,1063,1,0,0,0,1063,1068,1,0,
        0,0,1064,1066,3,202,101,0,1065,1067,5,139,0,0,1066,1065,1,0,0,0,
        1066,1067,1,0,0,0,1067,1069,1,0,0,0,1068,1064,1,0,0,0,1068,1069,
        1,0,0,0,1069,1074,1,0,0,0,1070,1072,3,116,58,0,1071,1073,5,139,0,
        0,1072,1071,1,0,0,0,1072,1073,1,0,0,0,1073,1075,1,0,0,0,1074,1070,
        1,0,0,0,1074,1075,1,0,0,0,1075,1080,1,0,0,0,1076,1078,3,112,56,0,
        1077,1079,5,139,0,0,1078,1077,1,0,0,0,1078,1079,1,0,0,0,1079,1081,
        1,0,0,0,1080,1076,1,0,0,0,1080,1081,1,0,0,0,1081,1082,1,0,0,0,1082,
        1083,5,5,0,0,1083,105,1,0,0,0,1084,1086,3,108,54,0,1085,1087,5,139,
        0,0,1086,1085,1,0,0,0,1086,1087,1,0,0,0,1087,1088,1,0,0,0,1088,1089,
        3,104,52,0,1089,107,1,0,0,0,1090,1092,3,228,114,0,1091,1093,5,139,
        0,0,1092,1091,1,0,0,0,1092,1093,1,0,0,0,1093,1094,1,0,0,0,1094,1096,
        3,232,116,0,1095,1097,5,139,0,0,1096,1095,1,0,0,0,1096,1097,1,0,
        0,0,1097,1099,1,0,0,0,1098,1100,3,110,55,0,1099,1098,1,0,0,0,1099,
        1100,1,0,0,0,1100,1102,1,0,0,0,1101,1103,5,139,0,0,1102,1101,1,0,
        0,0,1102,1103,1,0,0,0,1103,1104,1,0,0,0,1104,1106,3,232,116,0,1105,
        1107,5,139,0,0,1106,1105,1,0,0,0,1106,1107,1,0,0,0,1107,1108,1,0,
        0,0,1108,1109,3,230,115,0,1109,1155,1,0,0,0,1110,1112,3,228,114,
        0,1111,1113,5,139,0,0,1112,1111,1,0,0,0,1112,1113,1,0,0,0,1113,1114,
        1,0,0,0,1114,1116,3,232,116,0,1115,1117,5,139,0,0,1116,1115,1,0,
        0,0,1116,1117,1,0,0,0,1117,1119,1,0,0,0,1118,1120,3,110,55,0,1119,
        1118,1,0,0,0,1119,1120,1,0,0,0,1120,1122,1,0,0,0,1121,1123,5,139,
        0,0,1122,1121,1,0,0,0,1122,1123,1,0,0,0,1123,1124,1,0,0,0,1124,1125,
        3,232,116,0,1125,1155,1,0,0,0,1126,1128,3,232,116,0,1127,1129,5,
        139,0,0,1128,1127,1,0,0,0,1128,1129,1,0,0,0,1129,1131,1,0,0,0,1130,
        1132,3,110,55,0,1131,1130,1,0,0,0,1131,1132,1,0,0,0,1132,1134,1,
        0,0,0,1133,1135,5,139,0,0,1134,1133,1,0,0,0,1134,1135,1,0,0,0,1135,
        1136,1,0,0,0,1136,1138,3,232,116,0,1137,1139,5,139,0,0,1138,1137,
        1,0,0,0,1138,1139,1,0,0,0,1139,1140,1,0,0,0,1140,1141,3,230,115,
        0,1141,1155,1,0,0,0,1142,1144,3,232,116,0,1143,1145,5,139,0,0,1144,
        1143,1,0,0,0,1144,1145,1,0,0,0,1145,1147,1,0,0,0,1146,1148,3,110,
        55,0,1147,1146,1,0,0,0,1147,1148,1,0,0,0,1148,1150,1,0,0,0,1149,
        1151,5,139,0,0,1150,1149,1,0,0,0,1150,1151,1,0,0,0,1151,1152,1,0,
        0,0,1152,1153,3,232,116,0,1153,1155,1,0,0,0,1154,1090,1,0,0,0,1154,
        1110,1,0,0,0,1154,1126,1,0,0,0,1154,1142,1,0,0,0,1155,109,1,0,0,
        0,1156,1158,5,12,0,0,1157,1159,5,139,0,0,1158,1157,1,0,0,0,1158,
        1159,1,0,0,0,1159,1164,1,0,0,0,1160,1162,3,202,101,0,1161,1163,5,
        139,0,0,1162,1161,1,0,0,0,1162,1163,1,0,0,0,1163,1165,1,0,0,0,1164,
        1160,1,0,0,0,1164,1165,1,0,0,0,1165,1170,1,0,0,0,1166,1168,3,114,
        57,0,1167,1169,5,139,0,0,1168,1167,1,0,0,0,1168,1169,1,0,0,0,1169,
        1171,1,0,0,0,1170,1166,1,0,0,0,1170,1171,1,0,0,0,1171,1173,1,0,0,
        0,1172,1174,3,120,60,0,1173,1172,1,0,0,0,1173,1174,1,0,0,0,1174,
        1179,1,0,0,0,1175,1177,3,112,56,0,1176,1178,5,139,0,0,1177,1176,
        1,0,0,0,1177,1178,1,0,0,0,1178,1180,1,0,0,0,1179,1175,1,0,0,0,1179,
        1180,1,0,0,0,1180,1181,1,0,0,0,1181,1182,5,13,0,0,1182,111,1,0,0,
        0,1183,1186,3,216,108,0,1184,1186,3,220,110,0,1185,1183,1,0,0,0,
        1185,1184,1,0,0,0,1186,113,1,0,0,0,1187,1189,5,2,0,0,1188,1190,5,
        139,0,0,1189,1188,1,0,0,0,1189,1190,1,0,0,0,1190,1191,1,0,0,0,1191,
        1205,3,124,62,0,1192,1194,5,139,0,0,1193,1192,1,0,0,0,1193,1194,
        1,0,0,0,1194,1195,1,0,0,0,1195,1197,5,6,0,0,1196,1198,5,2,0,0,1197,
        1196,1,0,0,0,1197,1198,1,0,0,0,1198,1200,1,0,0,0,1199,1201,5,139,
        0,0,1200,1199,1,0,0,0,1200,1201,1,0,0,0,1201,1202,1,0,0,0,1202,1204,
        3,124,62,0,1203,1193,1,0,0,0,1204,1207,1,0,0,0,1205,1203,1,0,0,0,
        1205,1206,1,0,0,0,1206,115,1,0,0,0,1207,1205,1,0,0,0,1208,1215,3,
        118,59,0,1209,1211,5,139,0,0,1210,1209,1,0,0,0,1210,1211,1,0,0,0,
        1211,1212,1,0,0,0,1212,1214,3,118,59,0,1213,1210,1,0,0,0,1214,1217,
        1,0,0,0,1215,1213,1,0,0,0,1215,1216,1,0,0,0,1216,117,1,0,0,0,1217,
        1215,1,0,0,0,1218,1220,5,2,0,0,1219,1221,5,139,0,0,1220,1219,1,0,
        0,0,1220,1221,1,0,0,0,1221,1222,1,0,0,0,1222,1223,3,122,61,0,1223,
        119,1,0,0,0,1224,1226,5,11,0,0,1225,1227,5,139,0,0,1226,1225,1,0,
        0,0,1226,1227,1,0,0,0,1227,1232,1,0,0,0,1228,1230,3,210,105,0,1229,
        1231,5,139,0,0,1230,1229,1,0,0,0,1230,1231,1,0,0,0,1231,1233,1,0,
        0,0,1232,1228,1,0,0,0,1232,1233,1,0,0,0,1233,1244,1,0,0,0,1234,1236,
        5,14,0,0,1235,1237,5,139,0,0,1236,1235,1,0,0,0,1236,1237,1,0,0,0,
        1237,1242,1,0,0,0,1238,1240,3,210,105,0,1239,1241,5,139,0,0,1240,
        1239,1,0,0,0,1240,1241,1,0,0,0,1241,1243,1,0,0,0,1242,1238,1,0,0,
        0,1242,1243,1,0,0,0,1243,1245,1,0,0,0,1244,1234,1,0,0,0,1244,1245,
        1,0,0,0,1245,121,1,0,0,0,1246,1247,3,222,111,0,1247,123,1,0,0,0,
        1248,1249,3,222,111,0,1249,125,1,0,0,0,1250,1255,3,164,82,0,1251,
        1253,5,139,0,0,1252,1251,1,0,0,0,1252,1253,1,0,0,0,1253,1254,1,0,
        0,0,1254,1256,3,162,81,0,1255,1252,1,0,0,0,1256,1257,1,0,0,0,1257,
        1255,1,0,0,0,1257,1258,1,0,0,0,1258,127,1,0,0,0,1259,1260,3,130,
        65,0,1260,129,1,0,0,0,1261,1268,3,132,66,0,1262,1263,5,139,0,0,1263,
        1264,5,86,0,0,1264,1265,5,139,0,0,1265,1267,3,132,66,0,1266,1262,
        1,0,0,0,1267,1270,1,0,0,0,1268,1266,1,0,0,0,1268,1269,1,0,0,0,1269,
        131,1,0,0,0,1270,1268,1,0,0,0,1271,1278,3,134,67,0,1272,1273,5,139,
        0,0,1273,1274,5,87,0,0,1274,1275,5,139,0,0,1275,1277,3,134,67,0,
        1276,1272,1,0,0,0,1277,1280,1,0,0,0,1278,1276,1,0,0,0,1278,1279,
        1,0,0,0,1279,133,1,0,0,0,1280,1278,1,0,0,0,1281,1288,3,136,68,0,
        1282,1283,5,139,0,0,1283,1284,5,88,0,0,1284,1285,5,139,0,0,1285,
        1287,3,136,68,0,1286,1282,1,0,0,0,1287,1290,1,0,0,0,1288,1286,1,
        0,0,0,1288,1289,1,0,0,0,1289,135,1,0,0,0,1290,1288,1,0,0,0,1291,
        1293,5,89,0,0,1292,1294,5,139,0,0,1293,1292,1,0,0,0,1293,1294,1,
        0,0,0,1294,1296,1,0,0,0,1295,1291,1,0,0,0,1296,1299,1,0,0,0,1297,
        1295,1,0,0,0,1297,1298,1,0,0,0,1298,1300,1,0,0,0,1299,1297,1,0,0,
        0,1300,1301,3,138,69,0,1301,137,1,0,0,0,1302,1309,3,142,71,0,1303,
        1305,5,139,0,0,1304,1303,1,0,0,0,1304,1305,1,0,0,0,1305,1306,1,0,
        0,0,1306,1308,3,140,70,0,1307,1304,1,0,0,0,1308,1311,1,0,0,0,1309,
        1307,1,0,0,0,1309,1310,1,0,0,0,1310,139,1,0,0,0,1311,1309,1,0,0,
        0,1312,1314,5,9,0,0,1313,1315,5,139,0,0,1314,1313,1,0,0,0,1314,1315,
        1,0,0,0,1315,1316,1,0,0,0,1316,1343,3,142,71,0,1317,1319,5,15,0,
        0,1318,1320,5,139,0,0,1319,1318,1,0,0,0,1319,1320,1,0,0,0,1320,1321,
        1,0,0,0,1321,1343,3,142,71,0,1322,1324,5,16,0,0,1323,1325,5,139,
        0,0,1324,1323,1,0,0,0,1324,1325,1,0,0,0,1325,1326,1,0,0,0,1326,1343,
        3,142,71,0,1327,1329,5,17,0,0,1328,1330,5,139,0,0,1329,1328,1,0,
        0,0,1329,1330,1,0,0,0,1330,1331,1,0,0,0,1331,1343,3,142,71,0,1332,
        1334,5,18,0,0,1333,1335,5,139,0,0,1334,1333,1,0,0,0,1334,1335,1,
        0,0,0,1335,1336,1,0,0,0,1336,1343,3,142,71,0,1337,1339,5,19,0,0,
        1338,1340,5,139,0,0,1339,1338,1,0,0,0,1339,1340,1,0,0,0,1340,1341,
        1,0,0,0,1341,1343,3,142,71,0,1342,1312,1,0,0,0,1342,1317,1,0,0,0,
        1342,1322,1,0,0,0,1342,1327,1,0,0,0,1342,1332,1,0,0,0,1342,1337,
        1,0,0,0,1343,141,1,0,0,0,1344,1350,3,150,75,0,1345,1349,3,144,72,
        0,1346,1349,3,146,73,0,1347,1349,3,148,74,0,1348,1345,1,0,0,0,1348,
        1346,1,0,0,0,1348,1347,1,0,0,0,1349,1352,1,0,0,0,1350,1348,1,0,0,
        0,1350,1351,1,0,0,0,1351,143,1,0,0,0,1352,1350,1,0,0,0,1353,1354,
        5,139,0,0,1354,1355,5,90,0,0,1355,1356,5,139,0,0,1356,1364,5,72,
        0,0,1357,1358,5,139,0,0,1358,1359,5,91,0,0,1359,1360,5,139,0,0,1360,
        1364,5,72,0,0,1361,1362,5,139,0,0,1362,1364,5,92,0,0,1363,1353,1,
        0,0,0,1363,1357,1,0,0,0,1363,1361,1,0,0,0,1364,1366,1,0,0,0,1365,
        1367,5,139,0,0,1366,1365,1,0,0,0,1366,1367,1,0,0,0,1367,1368,1,0,
        0,0,1368,1369,3,150,75,0,1369,145,1,0,0,0,1370,1371,5,139,0,0,1371,
        1373,5,93,0,0,1372,1374,5,139,0,0,1373,1372,1,0,0,0,1373,1374,1,
        0,0,0,1374,1375,1,0,0,0,1375,1376,3,150,75,0,1376,147,1,0,0,0,1377,
        1378,5,139,0,0,1378,1379,5,94,0,0,1379,1380,5,139,0,0,1380,1388,
        5,95,0,0,1381,1382,5,139,0,0,1382,1383,5,94,0,0,1383,1384,5,139,
        0,0,1384,1385,5,89,0,0,1385,1386,5,139,0,0,1386,1388,5,95,0,0,1387,
        1377,1,0,0,0,1387,1381,1,0,0,0,1388,149,1,0,0,0,1389,1408,3,152,
        76,0,1390,1392,5,139,0,0,1391,1390,1,0,0,0,1391,1392,1,0,0,0,1392,
        1393,1,0,0,0,1393,1395,5,20,0,0,1394,1396,5,139,0,0,1395,1394,1,
        0,0,0,1395,1396,1,0,0,0,1396,1397,1,0,0,0,1397,1407,3,152,76,0,1398,
        1400,5,139,0,0,1399,1398,1,0,0,0,1399,1400,1,0,0,0,1400,1401,1,0,
        0,0,1401,1403,5,21,0,0,1402,1404,5,139,0,0,1403,1402,1,0,0,0,1403,
        1404,1,0,0,0,1404,1405,1,0,0,0,1405,1407,3,152,76,0,1406,1391,1,
        0,0,0,1406,1399,1,0,0,0,1407,1410,1,0,0,0,1408,1406,1,0,0,0,1408,
        1409,1,0,0,0,1409,151,1,0,0,0,1410,1408,1,0,0,0,1411,1438,3,154,
        77,0,1412,1414,5,139,0,0,1413,1412,1,0,0,0,1413,1414,1,0,0,0,1414,
        1415,1,0,0,0,1415,1417,5,11,0,0,1416,1418,5,139,0,0,1417,1416,1,
        0,0,0,1417,1418,1,0,0,0,1418,1419,1,0,0,0,1419,1437,3,154,77,0,1420,
        1422,5,139,0,0,1421,1420,1,0,0,0,1421,1422,1,0,0,0,1422,1423,1,0,
        0,0,1423,1425,5,22,0,0,1424,1426,5,139,0,0,1425,1424,1,0,0,0,1425,
        1426,1,0,0,0,1426,1427,1,0,0,0,1427,1437,3,154,77,0,1428,1430,5,
        139,0,0,1429,1428,1,0,0,0,1429,1430,1,0,0,0,1430,1431,1,0,0,0,1431,
        1433,5,23,0,0,1432,1434,5,139,0,0,1433,1432,1,0,0,0,1433,1434,1,
        0,0,0,1434,1435,1,0,0,0,1435,1437,3,154,77,0,1436,1413,1,0,0,0,1436,
        1421,1,0,0,0,1436,1429,1,0,0,0,1437,1440,1,0,0,0,1438,1436,1,0,0,
        0,1438,1439,1,0,0,0,1439,153,1,0,0,0,1440,1438,1,0,0,0,1441,1452,
        3,156,78,0,1442,1444,5,139,0,0,1443,1442,1,0,0,0,1443,1444,1,0,0,
        0,1444,1445,1,0,0,0,1445,1447,5,24,0,0,1446,1448,5,139,0,0,1447,
        1446,1,0,0,0,1447,1448,1,0,0,0,1448,1449,1,0,0,0,1449,1451,3,156,
        78,0,1450,1443,1,0,0,0,1451,1454,1,0,0,0,1452,1450,1,0,0,0,1452,
        1453,1,0,0,0,1453,155,1,0,0,0,1454,1452,1,0,0,0,1455,1462,3,158,
        79,0,1456,1458,7,3,0,0,1457,1459,5,139,0,0,1458,1457,1,0,0,0,1458,
        1459,1,0,0,0,1459,1460,1,0,0,0,1460,1462,3,158,79,0,1461,1455,1,
        0,0,0,1461,1456,1,0,0,0,1462,157,1,0,0,0,1463,1474,3,164,82,0,1464,
        1466,5,139,0,0,1465,1464,1,0,0,0,1465,1466,1,0,0,0,1466,1467,1,0,
        0,0,1467,1473,3,160,80,0,1468,1470,5,139,0,0,1469,1468,1,0,0,0,1469,
        1470,1,0,0,0,1470,1471,1,0,0,0,1471,1473,3,162,81,0,1472,1465,1,
        0,0,0,1472,1469,1,0,0,0,1473,1476,1,0,0,0,1474,1472,1,0,0,0,1474,
        1475,1,0,0,0,1475,1481,1,0,0,0,1476,1474,1,0,0,0,1477,1479,5,139,
        0,0,1478,1477,1,0,0,0,1478,1479,1,0,0,0,1479,1480,1,0,0,0,1480,1482,
        3,116,58,0,1481,1478,1,0,0,0,1481,1482,1,0,0,0,1482,159,1,0,0,0,
        1483,1484,5,12,0,0,1484,1485,3,128,64,0,1485,1486,5,13,0,0,1486,
        1497,1,0,0,0,1487,1489,5,12,0,0,1488,1490,3,128,64,0,1489,1488,1,
        0,0,0,1489,1490,1,0,0,0,1490,1491,1,0,0,0,1491,1493,5,14,0,0,1492,
        1494,3,128,64,0,1493,1492,1,0,0,0,1493,1494,1,0,0,0,1494,1495,1,
        0,0,0,1495,1497,5,13,0,0,1496,1483,1,0,0,0,1496,1487,1,0,0,0,1497,
        161,1,0,0,0,1498,1500,5,25,0,0,1499,1501,5,139,0,0,1500,1499,1,0,
        0,0,1500,1501,1,0,0,0,1501,1502,1,0,0,0,1502,1503,3,218,109,0,1503,
        163,1,0,0,0,1504,1531,3,204,102,0,1505,1531,3,220,110,0,1506,1531,
        3,166,83,0,1507,1509,5,96,0,0,1508,1510,5,139,0,0,1509,1508,1,0,
        0,0,1509,1510,1,0,0,0,1510,1511,1,0,0,0,1511,1513,5,3,0,0,1512,1514,
        5,139,0,0,1513,1512,1,0,0,0,1513,1514,1,0,0,0,1514,1515,1,0,0,0,
        1515,1517,5,11,0,0,1516,1518,5,139,0,0,1517,1516,1,0,0,0,1517,1518,
        1,0,0,0,1518,1519,1,0,0,0,1519,1531,5,5,0,0,1520,1531,3,170,85,0,
        1521,1531,3,172,86,0,1522,1531,3,184,92,0,1523,1531,3,98,49,0,1524,
        1531,3,174,87,0,1525,1531,3,178,89,0,1526,1531,3,180,90,0,1527,1531,
        3,186,93,0,1528,1531,3,190,95,0,1529,1531,3,202,101,0,1530,1504,
        1,0,0,0,1530,1505,1,0,0,0,1530,1506,1,0,0,0,1530,1507,1,0,0,0,1530,
        1520,1,0,0,0,1530,1521,1,0,0,0,1530,1522,1,0,0,0,1530,1523,1,0,0,
        0,1530,1524,1,0,0,0,1530,1525,1,0,0,0,1530,1526,1,0,0,0,1530,1527,
        1,0,0,0,1530,1528,1,0,0,0,1530,1529,1,0,0,0,1531,165,1,0,0,0,1532,
        1537,5,97,0,0,1533,1535,5,139,0,0,1534,1533,1,0,0,0,1534,1535,1,
        0,0,0,1535,1536,1,0,0,0,1536,1538,3,168,84,0,1537,1534,1,0,0,0,1538,
        1539,1,0,0,0,1539,1537,1,0,0,0,1539,1540,1,0,0,0,1540,1555,1,0,0,
        0,1541,1543,5,97,0,0,1542,1544,5,139,0,0,1543,1542,1,0,0,0,1543,
        1544,1,0,0,0,1544,1545,1,0,0,0,1545,1550,3,128,64,0,1546,1548,5,
        139,0,0,1547,1546,1,0,0,0,1547,1548,1,0,0,0,1548,1549,1,0,0,0,1549,
        1551,3,168,84,0,1550,1547,1,0,0,0,1551,1552,1,0,0,0,1552,1550,1,
        0,0,0,1552,1553,1,0,0,0,1553,1555,1,0,0,0,1554,1532,1,0,0,0,1554,
        1541,1,0,0,0,1555,1564,1,0,0,0,1556,1558,5,139,0,0,1557,1556,1,0,
        0,0,1557,1558,1,0,0,0,1558,1559,1,0,0,0,1559,1561,5,98,0,0,1560,
        1562,5,139,0,0,1561,1560,1,0,0,0,1561,1562,1,0,0,0,1562,1563,1,0,
        0,0,1563,1565,3,128,64,0,1564,1557,1,0,0,0,1564,1565,1,0,0,0,1565,
        1567,1,0,0,0,1566,1568,5,139,0,0,1567,1566,1,0,0,0,1567,1568,1,0,
        0,0,1568,1569,1,0,0,0,1569,1570,5,99,0,0,1570,167,1,0,0,0,1571,1573,
        5,100,0,0,1572,1574,5,139,0,0,1573,1572,1,0,0,0,1573,1574,1,0,0,
        0,1574,1575,1,0,0,0,1575,1577,3,128,64,0,1576,1578,5,139,0,0,1577,
        1576,1,0,0,0,1577,1578,1,0,0,0,1578,1579,1,0,0,0,1579,1581,5,101,
        0,0,1580,1582,5,139,0,0,1581,1580,1,0,0,0,1581,1582,1,0,0,0,1582,
        1583,1,0,0,0,1583,1584,3,128,64,0,1584,169,1,0,0,0,1585,1587,5,12,
        0,0,1586,1588,5,139,0,0,1587,1586,1,0,0,0,1587,1588,1,0,0,0,1588,
        1589,1,0,0,0,1589,1598,3,176,88,0,1590,1592,5,139,0,0,1591,1590,
        1,0,0,0,1591,1592,1,0,0,0,1592,1593,1,0,0,0,1593,1595,5,6,0,0,1594,
        1596,5,139,0,0,1595,1594,1,0,0,0,1595,1596,1,0,0,0,1596,1597,1,0,
        0,0,1597,1599,3,128,64,0,1598,1591,1,0,0,0,1598,1599,1,0,0,0,1599,
        1601,1,0,0,0,1600,1602,5,139,0,0,1601,1600,1,0,0,0,1601,1602,1,0,
        0,0,1602,1603,1,0,0,0,1603,1604,5,13,0,0,1604,171,1,0,0,0,1605,1607,
        5,12,0,0,1606,1608,5,139,0,0,1607,1606,1,0,0,0,1607,1608,1,0,0,0,
        1608,1617,1,0,0,0,1609,1611,3,202,101,0,1610,1612,5,139,0,0,1611,
        1610,1,0,0,0,1611,1612,1,0,0,0,1612,1613,1,0,0,0,1613,1615,5,9,0,
        0,1614,1616,5,139,0,0,1615,1614,1,0,0,0,1615,1616,1,0,0,0,1616,1618,
        1,0,0,0,1617,1609,1,0,0,0,1617,1618,1,0,0,0,1618,1619,1,0,0,0,1619,
        1621,3,102,51,0,1620,1622,5,139,0,0,1621,1620,1,0,0,0,1621,1622,
        1,0,0,0,1622,1627,1,0,0,0,1623,1625,3,90,45,0,1624,1626,5,139,0,
        0,1625,1624,1,0,0,0,1625,1626,1,0,0,0,1626,1628,1,0,0,0,1627,1623,
        1,0,0,0,1627,1628,1,0,0,0,1628,1629,1,0,0,0,1629,1631,5,6,0,0,1630,
        1632,5,139,0,0,1631,1630,1,0,0,0,1631,1632,1,0,0,0,1632,1633,1,0,
        0,0,1633,1635,3,128,64,0,1634,1636,5,139,0,0,1635,1634,1,0,0,0,1635,
        1636,1,0,0,0,1636,1637,1,0,0,0,1637,1638,5,13,0,0,1638,173,1,0,0,
        0,1639,1641,5,52,0,0,1640,1642,5,139,0,0,1641,1640,1,0,0,0,1641,
        1642,1,0,0,0,1642,1643,1,0,0,0,1643,1645,5,3,0,0,1644,1646,5,139,
        0,0,1645,1644,1,0,0,0,1645,1646,1,0,0,0,1646,1647,1,0,0,0,1647,1649,
        3,176,88,0,1648,1650,5,139,0,0,1649,1648,1,0,0,0,1649,1650,1,0,0,
        0,1650,1651,1,0,0,0,1651,1652,5,5,0,0,1652,1696,1,0,0,0,1653,1655,
        5,102,0,0,1654,1656,5,139,0,0,1655,1654,1,0,0,0,1655,1656,1,0,0,
        0,1656,1657,1,0,0,0,1657,1659,5,3,0,0,1658,1660,5,139,0,0,1659,1658,
        1,0,0,0,1659,1660,1,0,0,0,1660,1661,1,0,0,0,1661,1663,3,176,88,0,
        1662,1664,5,139,0,0,1663,1662,1,0,0,0,1663,1664,1,0,0,0,1664,1665,
        1,0,0,0,1665,1666,5,5,0,0,1666,1696,1,0,0,0,1667,1669,5,103,0,0,
        1668,1670,5,139,0,0,1669,1668,1,0,0,0,1669,1670,1,0,0,0,1670,1671,
        1,0,0,0,1671,1673,5,3,0,0,1672,1674,5,139,0,0,1673,1672,1,0,0,0,
        1673,1674,1,0,0,0,1674,1675,1,0,0,0,1675,1677,3,176,88,0,1676,1678,
        5,139,0,0,1677,1676,1,0,0,0,1677,1678,1,0,0,0,1678,1679,1,0,0,0,
        1679,1680,5,5,0,0,1680,1696,1,0,0,0,1681,1683,5,104,0,0,1682,1684,
        5,139,0,0,1683,1682,1,0,0,0,1683,1684,1,0,0,0,1684,1685,1,0,0,0,
        1685,1687,5,3,0,0,1686,1688,5,139,0,0,1687,1686,1,0,0,0,1687,1688,
        1,0,0,0,1688,1689,1,0,0,0,1689,1691,3,176,88,0,1690,1692,5,139,0,
        0,1691,1690,1,0,0,0,1691,1692,1,0,0,0,1692,1693,1,0,0,0,1693,1694,
        5,5,0,0,1694,1696,1,0,0,0,1695,1639,1,0,0,0,1695,1653,1,0,0,0,1695,
        1667,1,0,0,0,1695,1681,1,0,0,0,1696,175,1,0,0,0,1697,1702,3,182,
        91,0,1698,1700,5,139,0,0,1699,1698,1,0,0,0,1699,1700,1,0,0,0,1700,
        1701,1,0,0,0,1701,1703,3,90,45,0,1702,1699,1,0,0,0,1702,1703,1,0,
        0,0,1703,177,1,0,0,0,1704,1705,3,102,51,0,1705,179,1,0,0,0,1706,
        1708,5,3,0,0,1707,1709,5,139,0,0,1708,1707,1,0,0,0,1708,1709,1,0,
        0,0,1709,1710,1,0,0,0,1710,1712,3,128,64,0,1711,1713,5,139,0,0,1712,
        1711,1,0,0,0,1712,1713,1,0,0,0,1713,1714,1,0,0,0,1714,1715,5,5,0,
        0,1715,181,1,0,0,0,1716,1717,3,202,101,0,1717,1718,5,139,0,0,1718,
        1719,5,93,0,0,1719,1720,5,139,0,0,1720,1721,3,128,64,0,1721,183,
        1,0,0,0,1722,1724,5,105,0,0,1723,1725,5,139,0,0,1724,1723,1,0,0,
        0,1724,1725,1,0,0,0,1725,1726,1,0,0,0,1726,1728,5,3,0,0,1727,1729,
        5,139,0,0,1728,1727,1,0,0,0,1728,1729,1,0,0,0,1729,1730,1,0,0,0,
        1730,1732,3,202,101,0,1731,1733,5,139,0,0,1732,1731,1,0,0,0,1732,
        1733,1,0,0,0,1733,1734,1,0,0,0,1734,1736,5,9,0,0,1735,1737,5,139,
        0,0,1736,1735,1,0,0,0,1736,1737,1,0,0,0,1737,1738,1,0,0,0,1738,1740,
        3,128,64,0,1739,1741,5,139,0,0,1740,1739,1,0,0,0,1740,1741,1,0,0,
        0,1741,1742,1,0,0,0,1742,1744,5,4,0,0,1743,1745,5,139,0,0,1744,1743,
        1,0,0,0,1744,1745,1,0,0,0,1745,1746,1,0,0,0,1746,1748,3,182,91,0,
        1747,1749,5,139,0,0,1748,1747,1,0,0,0,1748,1749,1,0,0,0,1749,1750,
        1,0,0,0,1750,1752,5,6,0,0,1751,1753,5,139,0,0,1752,1751,1,0,0,0,
        1752,1753,1,0,0,0,1753,1754,1,0,0,0,1754,1756,3,128,64,0,1755,1757,
        5,139,0,0,1756,1755,1,0,0,0,1756,1757,1,0,0,0,1757,1758,1,0,0,0,
        1758,1759,5,5,0,0,1759,185,1,0,0,0,1760,1762,3,188,94,0,1761,1763,
        5,139,0,0,1762,1761,1,0,0,0,1762,1763,1,0,0,0,1763,1764,1,0,0,0,
        1764,1766,5,3,0,0,1765,1767,5,139,0,0,1766,1765,1,0,0,0,1766,1767,
        1,0,0,0,1767,1772,1,0,0,0,1768,1770,5,74,0,0,1769,1771,5,139,0,0,
        1770,1769,1,0,0,0,1770,1771,1,0,0,0,1771,1773,1,0,0,0,1772,1768,
        1,0,0,0,1772,1773,1,0,0,0,1773,1791,1,0,0,0,1774,1776,3,128,64,0,
        1775,1777,5,139,0,0,1776,1775,1,0,0,0,1776,1777,1,0,0,0,1777,1788,
        1,0,0,0,1778,1780,5,4,0,0,1779,1781,5,139,0,0,1780,1779,1,0,0,0,
        1780,1781,1,0,0,0,1781,1782,1,0,0,0,1782,1784,3,128,64,0,1783,1785,
        5,139,0,0,1784,1783,1,0,0,0,1784,1785,1,0,0,0,1785,1787,1,0,0,0,
        1786,1778,1,0,0,0,1787,1790,1,0,0,0,1788,1786,1,0,0,0,1788,1789,
        1,0,0,0,1789,1792,1,0,0,0,1790,1788,1,0,0,0,1791,1774,1,0,0,0,1791,
        1792,1,0,0,0,1792,1793,1,0,0,0,1793,1794,5,5,0,0,1794,187,1,0,0,
        0,1795,1796,3,200,100,0,1796,1797,3,226,113,0,1797,189,1,0,0,0,1798,
        1800,5,106,0,0,1799,1801,5,139,0,0,1800,1799,1,0,0,0,1800,1801,1,
        0,0,0,1801,1802,1,0,0,0,1802,1804,5,7,0,0,1803,1805,5,139,0,0,1804,
        1803,1,0,0,0,1804,1805,1,0,0,0,1805,1822,1,0,0,0,1806,1823,3,24,
        12,0,1807,1809,3,36,18,0,1808,1810,5,139,0,0,1809,1808,1,0,0,0,1809,
        1810,1,0,0,0,1810,1812,1,0,0,0,1811,1807,1,0,0,0,1812,1813,1,0,0,
        0,1813,1811,1,0,0,0,1813,1814,1,0,0,0,1814,1823,1,0,0,0,1815,1820,
        3,92,46,0,1816,1818,5,139,0,0,1817,1816,1,0,0,0,1817,1818,1,0,0,
        0,1818,1819,1,0,0,0,1819,1821,3,90,45,0,1820,1817,1,0,0,0,1820,1821,
        1,0,0,0,1821,1823,1,0,0,0,1822,1806,1,0,0,0,1822,1811,1,0,0,0,1822,
        1815,1,0,0,0,1823,1825,1,0,0,0,1824,1826,5,139,0,0,1825,1824,1,0,
        0,0,1825,1826,1,0,0,0,1826,1827,1,0,0,0,1827,1828,5,8,0,0,1828,191,
        1,0,0,0,1829,1831,3,198,99,0,1830,1832,5,139,0,0,1831,1830,1,0,0,
        0,1831,1832,1,0,0,0,1832,1833,1,0,0,0,1833,1835,5,3,0,0,1834,1836,
        5,139,0,0,1835,1834,1,0,0,0,1835,1836,1,0,0,0,1836,1854,1,0,0,0,
        1837,1839,3,128,64,0,1838,1840,5,139,0,0,1839,1838,1,0,0,0,1839,
        1840,1,0,0,0,1840,1851,1,0,0,0,1841,1843,5,4,0,0,1842,1844,5,139,
        0,0,1843,1842,1,0,0,0,1843,1844,1,0,0,0,1844,1845,1,0,0,0,1845,1847,
        3,128,64,0,1846,1848,5,139,0,0,1847,1846,1,0,0,0,1847,1848,1,0,0,
        0,1848,1850,1,0,0,0,1849,1841,1,0,0,0,1850,1853,1,0,0,0,1851,1849,
        1,0,0,0,1851,1852,1,0,0,0,1852,1855,1,0,0,0,1853,1851,1,0,0,0,1854,
        1837,1,0,0,0,1854,1855,1,0,0,0,1855,1856,1,0,0,0,1856,1857,5,5,0,
        0,1857,193,1,0,0,0,1858,1859,3,198,99,0,1859,195,1,0,0,0,1860,1861,
        3,226,113,0,1861,197,1,0,0,0,1862,1863,3,200,100,0,1863,1864,3,226,
        113,0,1864,199,1,0,0,0,1865,1866,3,226,113,0,1866,1867,5,25,0,0,
        1867,1869,1,0,0,0,1868,1865,1,0,0,0,1869,1872,1,0,0,0,1870,1868,
        1,0,0,0,1870,1871,1,0,0,0,1871,201,1,0,0,0,1872,1870,1,0,0,0,1873,
        1874,3,226,113,0,1874,203,1,0,0,0,1875,1882,3,206,103,0,1876,1882,
        5,95,0,0,1877,1882,3,208,104,0,1878,1882,5,121,0,0,1879,1882,3,214,
        107,0,1880,1882,3,216,108,0,1881,1875,1,0,0,0,1881,1876,1,0,0,0,
        1881,1877,1,0,0,0,1881,1878,1,0,0,0,1881,1879,1,0,0,0,1881,1880,
        1,0,0,0,1882,205,1,0,0,0,1883,1884,7,4,0,0,1884,207,1,0,0,0,1885,
        1888,3,212,106,0,1886,1888,3,210,105,0,1887,1885,1,0,0,0,1887,1886,
        1,0,0,0,1888,209,1,0,0,0,1889,1890,7,5,0,0,1890,211,1,0,0,0,1891,
        1892,7,6,0,0,1892,213,1,0,0,0,1893,1895,5,12,0,0,1894,1896,5,139,
        0,0,1895,1894,1,0,0,0,1895,1896,1,0,0,0,1896,1914,1,0,0,0,1897,1899,
        3,128,64,0,1898,1900,5,139,0,0,1899,1898,1,0,0,0,1899,1900,1,0,0,
        0,1900,1911,1,0,0,0,1901,1903,5,4,0,0,1902,1904,5,139,0,0,1903,1902,
        1,0,0,0,1903,1904,1,0,0,0,1904,1905,1,0,0,0,1905,1907,3,128,64,0,
        1906,1908,5,139,0,0,1907,1906,1,0,0,0,1907,1908,1,0,0,0,1908,1910,
        1,0,0,0,1909,1901,1,0,0,0,1910,1913,1,0,0,0,1911,1909,1,0,0,0,1911,
        1912,1,0,0,0,1912,1915,1,0,0,0,1913,1911,1,0,0,0,1914,1897,1,0,0,
        0,1914,1915,1,0,0,0,1915,1916,1,0,0,0,1916,1917,5,13,0,0,1917,215,
        1,0,0,0,1918,1920,5,7,0,0,1919,1921,5,139,0,0,1920,1919,1,0,0,0,
        1920,1921,1,0,0,0,1921,1955,1,0,0,0,1922,1924,3,218,109,0,1923,1925,
        5,139,0,0,1924,1923,1,0,0,0,1924,1925,1,0,0,0,1925,1926,1,0,0,0,
        1926,1928,5,2,0,0,1927,1929,5,139,0,0,1928,1927,1,0,0,0,1928,1929,
        1,0,0,0,1929,1930,1,0,0,0,1930,1932,3,128,64,0,1931,1933,5,139,0,
        0,1932,1931,1,0,0,0,1932,1933,1,0,0,0,1933,1952,1,0,0,0,1934,1936,
        5,4,0,0,1935,1937,5,139,0,0,1936,1935,1,0,0,0,1936,1937,1,0,0,0,
        1937,1938,1,0,0,0,1938,1940,3,218,109,0,1939,1941,5,139,0,0,1940,
        1939,1,0,0,0,1940,1941,1,0,0,0,1941,1942,1,0,0,0,1942,1944,5,2,0,
        0,1943,1945,5,139,0,0,1944,1943,1,0,0,0,1944,1945,1,0,0,0,1945,1946,
        1,0,0,0,1946,1948,3,128,64,0,1947,1949,5,139,0,0,1948,1947,1,0,0,
        0,1948,1949,1,0,0,0,1949,1951,1,0,0,0,1950,1934,1,0,0,0,1951,1954,
        1,0,0,0,1952,1950,1,0,0,0,1952,1953,1,0,0,0,1953,1956,1,0,0,0,1954,
        1952,1,0,0,0,1955,1922,1,0,0,0,1955,1956,1,0,0,0,1956,1957,1,0,0,
        0,1957,1958,5,8,0,0,1958,217,1,0,0,0,1959,1960,3,222,111,0,1960,
        219,1,0,0,0,1961,1964,5,26,0,0,1962,1965,3,226,113,0,1963,1965,5,
        110,0,0,1964,1962,1,0,0,0,1964,1963,1,0,0,0,1965,221,1,0,0,0,1966,
        1969,3,226,113,0,1967,1969,3,224,112,0,1968,1966,1,0,0,0,1968,1967,
        1,0,0,0,1969,223,1,0,0,0,1970,1971,7,7,0,0,1971,225,1,0,0,0,1972,
        1973,7,8,0,0,1973,227,1,0,0,0,1974,1975,7,9,0,0,1975,229,1,0,0,0,
        1976,1977,7,10,0,0,1977,231,1,0,0,0,1978,1979,7,11,0,0,1979,233,
        1,0,0,0,364,235,239,242,245,254,260,268,272,276,280,284,288,291,
        297,301,305,309,317,321,325,329,333,341,345,349,353,361,365,369,
        373,381,385,389,393,397,403,407,411,415,420,424,434,442,446,451,
        456,464,472,476,481,486,496,500,505,512,517,520,524,528,532,538,
        542,547,552,556,559,561,565,569,574,578,583,587,598,605,614,628,
        632,636,644,648,653,656,662,666,670,676,680,684,687,691,701,708,
        721,725,731,735,739,744,749,753,759,763,769,773,779,783,787,791,
        795,799,804,811,815,820,827,833,838,844,847,853,855,859,863,868,
        872,875,882,889,892,898,901,907,911,915,919,923,928,933,937,942,
        945,954,963,968,981,984,992,996,1001,1006,1010,1015,1019,1023,1027,
        1031,1037,1042,1049,1053,1058,1062,1066,1068,1072,1074,1078,1080,
        1086,1092,1096,1099,1102,1106,1112,1116,1119,1122,1128,1131,1134,
        1138,1144,1147,1150,1154,1158,1162,1164,1168,1170,1173,1177,1179,
        1185,1189,1193,1197,1200,1205,1210,1215,1220,1226,1230,1232,1236,
        1240,1242,1244,1252,1257,1268,1278,1288,1293,1297,1304,1309,1314,
        1319,1324,1329,1334,1339,1342,1348,1350,1363,1366,1373,1387,1391,
        1395,1399,1403,1406,1408,1413,1417,1421,1425,1429,1433,1436,1438,
        1443,1447,1452,1458,1461,1465,1469,1472,1474,1478,1481,1489,1493,
        1496,1500,1509,1513,1517,1530,1534,1539,1543,1547,1552,1554,1557,
        1561,1564,1567,1573,1577,1581,1587,1591,1595,1598,1601,1607,1611,
        1615,1617,1621,1625,1627,1631,1635,1641,1645,1649,1655,1659,1663,
        1669,1673,1677,1683,1687,1691,1695,1699,1702,1708,1712,1724,1728,
        1732,1736,1740,1744,1748,1752,1756,1762,1766,1770,1772,1776,1780,
        1784,1788,1791,1800,1804,1809,1813,1817,1820,1822,1825,1831,1835,
        1839,1843,1847,1851,1854,1870,1881,1887,1895,1899,1903,1907,1911,
        1914,1920,1924,1928,1932,1936,1940,1944,1948,1952,1955,1964,1968
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
