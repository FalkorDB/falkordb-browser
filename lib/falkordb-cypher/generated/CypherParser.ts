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
    public static readonly UNION = 49;
    public static readonly ALL = 50;
    public static readonly FOREACH = 51;
    public static readonly OPTIONAL = 52;
    public static readonly MATCH = 53;
    public static readonly UNWIND = 54;
    public static readonly AS = 55;
    public static readonly MERGE = 56;
    public static readonly ON = 57;
    public static readonly CREATE = 58;
    public static readonly SET = 59;
    public static readonly DETACH = 60;
    public static readonly DELETE = 61;
    public static readonly REMOVE = 62;
    public static readonly CALL = 63;
    public static readonly YIELD = 64;
    public static readonly WITH = 65;
    public static readonly RETURN = 66;
    public static readonly DISTINCT = 67;
    public static readonly ORDER = 68;
    public static readonly BY = 69;
    public static readonly L_SKIP = 70;
    public static readonly LIMIT = 71;
    public static readonly ASCENDING = 72;
    public static readonly ASC = 73;
    public static readonly DESCENDING = 74;
    public static readonly DESC = 75;
    public static readonly WHERE = 76;
    public static readonly SHORTESTPATH = 77;
    public static readonly ALLSHORTESTPATHS = 78;
    public static readonly OR = 79;
    public static readonly XOR = 80;
    public static readonly AND = 81;
    public static readonly NOT = 82;
    public static readonly STARTS = 83;
    public static readonly ENDS = 84;
    public static readonly CONTAINS = 85;
    public static readonly IN = 86;
    public static readonly IS = 87;
    public static readonly NULL = 88;
    public static readonly COUNT = 89;
    public static readonly CASE = 90;
    public static readonly ELSE = 91;
    public static readonly END = 92;
    public static readonly WHEN = 93;
    public static readonly THEN = 94;
    public static readonly ANY = 95;
    public static readonly NONE = 96;
    public static readonly SINGLE = 97;
    public static readonly REDUCE = 98;
    public static readonly EXISTS = 99;
    public static readonly TRUE = 100;
    public static readonly FALSE = 101;
    public static readonly HexInteger = 102;
    public static readonly DecimalInteger = 103;
    public static readonly OctalInteger = 104;
    public static readonly HexLetter = 105;
    public static readonly HexDigit = 106;
    public static readonly Digit = 107;
    public static readonly NonZeroDigit = 108;
    public static readonly NonZeroOctDigit = 109;
    public static readonly OctDigit = 110;
    public static readonly ZeroDigit = 111;
    public static readonly ExponentDecimalReal = 112;
    public static readonly RegularDecimalReal = 113;
    public static readonly StringLiteral = 114;
    public static readonly EscapedChar = 115;
    public static readonly CONSTRAINT = 116;
    public static readonly DO = 117;
    public static readonly FOR = 118;
    public static readonly REQUIRE = 119;
    public static readonly UNIQUE = 120;
    public static readonly MANDATORY = 121;
    public static readonly SCALAR = 122;
    public static readonly OF = 123;
    public static readonly ADD = 124;
    public static readonly DROP = 125;
    public static readonly FILTER = 126;
    public static readonly EXTRACT = 127;
    public static readonly UnescapedSymbolicName = 128;
    public static readonly IdentifierStart = 129;
    public static readonly IdentifierPart = 130;
    public static readonly EscapedSymbolicName = 131;
    public static readonly SP = 132;
    public static readonly WHITESPACE = 133;
    public static readonly Comment = 134;
    public static readonly RULE_oC_Cypher = 0;
    public static readonly RULE_oC_Statement = 1;
    public static readonly RULE_oC_Query = 2;
    public static readonly RULE_oC_FalkorCommand = 3;
    public static readonly RULE_oC_CreateIndex = 4;
    public static readonly RULE_oC_DropIndex = 5;
    public static readonly RULE_oC_IndexEntity = 6;
    public static readonly RULE_oC_IndexProperties = 7;
    public static readonly RULE_oC_CreateConstraint = 8;
    public static readonly RULE_oC_DropConstraint = 9;
    public static readonly RULE_oC_ConstraintPredicate = 10;
    public static readonly RULE_oC_RegularQuery = 11;
    public static readonly RULE_oC_Union = 12;
    public static readonly RULE_oC_SingleQuery = 13;
    public static readonly RULE_oC_SinglePartQuery = 14;
    public static readonly RULE_oC_MultiPartQuery = 15;
    public static readonly RULE_oC_UpdatingClause = 16;
    public static readonly RULE_oC_ReadingClause = 17;
    public static readonly RULE_oC_Foreach = 18;
    public static readonly RULE_oC_CallSubquery = 19;
    public static readonly RULE_oC_Match = 20;
    public static readonly RULE_oC_Unwind = 21;
    public static readonly RULE_oC_Merge = 22;
    public static readonly RULE_oC_MergeAction = 23;
    public static readonly RULE_oC_Create = 24;
    public static readonly RULE_oC_Set = 25;
    public static readonly RULE_oC_SetItem = 26;
    public static readonly RULE_oC_Delete = 27;
    public static readonly RULE_oC_Remove = 28;
    public static readonly RULE_oC_RemoveItem = 29;
    public static readonly RULE_oC_InQueryCall = 30;
    public static readonly RULE_oC_StandaloneCall = 31;
    public static readonly RULE_oC_YieldItems = 32;
    public static readonly RULE_oC_YieldItem = 33;
    public static readonly RULE_oC_With = 34;
    public static readonly RULE_oC_Return = 35;
    public static readonly RULE_oC_ProjectionBody = 36;
    public static readonly RULE_oC_ProjectionItems = 37;
    public static readonly RULE_oC_ProjectionItem = 38;
    public static readonly RULE_oC_Order = 39;
    public static readonly RULE_oC_Skip = 40;
    public static readonly RULE_oC_Limit = 41;
    public static readonly RULE_oC_SortItem = 42;
    public static readonly RULE_oC_Where = 43;
    public static readonly RULE_oC_Pattern = 44;
    public static readonly RULE_oC_PatternPart = 45;
    public static readonly RULE_oC_AnonymousPatternPart = 46;
    public static readonly RULE_oC_ShortestPathPattern = 47;
    public static readonly RULE_oC_PatternElement = 48;
    public static readonly RULE_oC_RelationshipsPattern = 49;
    public static readonly RULE_oC_NodePattern = 50;
    public static readonly RULE_oC_PatternElementChain = 51;
    public static readonly RULE_oC_RelationshipPattern = 52;
    public static readonly RULE_oC_RelationshipDetail = 53;
    public static readonly RULE_oC_Properties = 54;
    public static readonly RULE_oC_RelationshipTypes = 55;
    public static readonly RULE_oC_NodeLabels = 56;
    public static readonly RULE_oC_NodeLabel = 57;
    public static readonly RULE_oC_RangeLiteral = 58;
    public static readonly RULE_oC_LabelName = 59;
    public static readonly RULE_oC_RelTypeName = 60;
    public static readonly RULE_oC_PropertyExpression = 61;
    public static readonly RULE_oC_Expression = 62;
    public static readonly RULE_oC_OrExpression = 63;
    public static readonly RULE_oC_XorExpression = 64;
    public static readonly RULE_oC_AndExpression = 65;
    public static readonly RULE_oC_NotExpression = 66;
    public static readonly RULE_oC_ComparisonExpression = 67;
    public static readonly RULE_oC_PartialComparisonExpression = 68;
    public static readonly RULE_oC_StringListNullPredicateExpression = 69;
    public static readonly RULE_oC_StringPredicateExpression = 70;
    public static readonly RULE_oC_ListPredicateExpression = 71;
    public static readonly RULE_oC_NullPredicateExpression = 72;
    public static readonly RULE_oC_AddOrSubtractExpression = 73;
    public static readonly RULE_oC_MultiplyDivideModuloExpression = 74;
    public static readonly RULE_oC_PowerOfExpression = 75;
    public static readonly RULE_oC_UnaryAddOrSubtractExpression = 76;
    public static readonly RULE_oC_NonArithmeticOperatorExpression = 77;
    public static readonly RULE_oC_ListOperatorExpression = 78;
    public static readonly RULE_oC_PropertyLookup = 79;
    public static readonly RULE_oC_Atom = 80;
    public static readonly RULE_oC_CaseExpression = 81;
    public static readonly RULE_oC_CaseAlternative = 82;
    public static readonly RULE_oC_ListComprehension = 83;
    public static readonly RULE_oC_PatternComprehension = 84;
    public static readonly RULE_oC_Quantifier = 85;
    public static readonly RULE_oC_FilterExpression = 86;
    public static readonly RULE_oC_PatternPredicate = 87;
    public static readonly RULE_oC_ParenthesizedExpression = 88;
    public static readonly RULE_oC_IdInColl = 89;
    public static readonly RULE_oC_ReduceExpression = 90;
    public static readonly RULE_oC_FunctionInvocation = 91;
    public static readonly RULE_oC_FunctionName = 92;
    public static readonly RULE_oC_ExistentialSubquery = 93;
    public static readonly RULE_oC_ExplicitProcedureInvocation = 94;
    public static readonly RULE_oC_ImplicitProcedureInvocation = 95;
    public static readonly RULE_oC_ProcedureResultField = 96;
    public static readonly RULE_oC_ProcedureName = 97;
    public static readonly RULE_oC_Namespace = 98;
    public static readonly RULE_oC_Variable = 99;
    public static readonly RULE_oC_Literal = 100;
    public static readonly RULE_oC_BooleanLiteral = 101;
    public static readonly RULE_oC_NumberLiteral = 102;
    public static readonly RULE_oC_IntegerLiteral = 103;
    public static readonly RULE_oC_DoubleLiteral = 104;
    public static readonly RULE_oC_ListLiteral = 105;
    public static readonly RULE_oC_MapLiteral = 106;
    public static readonly RULE_oC_PropertyKeyName = 107;
    public static readonly RULE_oC_Parameter = 108;
    public static readonly RULE_oC_SchemaName = 109;
    public static readonly RULE_oC_ReservedWord = 110;
    public static readonly RULE_oC_SymbolicName = 111;
    public static readonly RULE_oC_LeftArrowHead = 112;
    public static readonly RULE_oC_RightArrowHead = 113;
    public static readonly RULE_oC_Dash = 114;

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
        null, null, null, null, null, "'0'"
    ];

    public static readonly symbolicNames = [
        null, null, null, null, null, null, null, null, null, null, null, 
        null, null, null, null, null, null, null, null, null, null, null, 
        null, null, null, null, null, null, null, null, null, null, null, 
        null, null, null, null, null, null, null, null, null, null, null, 
        null, null, "INDEX", "ASSERT", "FULLTEXT", "UNION", "ALL", "FOREACH", 
        "OPTIONAL", "MATCH", "UNWIND", "AS", "MERGE", "ON", "CREATE", "SET", 
        "DETACH", "DELETE", "REMOVE", "CALL", "YIELD", "WITH", "RETURN", 
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
        "oC_DropIndex", "oC_IndexEntity", "oC_IndexProperties", "oC_CreateConstraint", 
        "oC_DropConstraint", "oC_ConstraintPredicate", "oC_RegularQuery", 
        "oC_Union", "oC_SingleQuery", "oC_SinglePartQuery", "oC_MultiPartQuery", 
        "oC_UpdatingClause", "oC_ReadingClause", "oC_Foreach", "oC_CallSubquery", 
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
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 231;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 230;
                this.match(CypherParser.SP);
                }
            }

            this.state = 233;
            this.oC_Statement();
            this.state = 238;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 2, this.context) ) {
            case 1:
                {
                this.state = 235;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 234;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 237;
                this.match(CypherParser.T__0);
                }
                break;
            }
            this.state = 241;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 240;
                this.match(CypherParser.SP);
                }
            }

            this.state = 243;
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
            this.state = 245;
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
            this.state = 250;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 4, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 247;
                this.oC_RegularQuery();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 248;
                this.oC_StandaloneCall();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 249;
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
            this.state = 256;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 5, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 252;
                this.oC_CreateIndex();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 253;
                this.oC_DropIndex();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 254;
                this.oC_CreateConstraint();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 255;
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
            this.state = 258;
            this.match(CypherParser.CREATE);
            this.state = 259;
            this.match(CypherParser.SP);
            this.state = 262;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 48) {
                {
                this.state = 260;
                this.match(CypherParser.FULLTEXT);
                this.state = 261;
                this.match(CypherParser.SP);
                }
            }

            this.state = 264;
            this.match(CypherParser.INDEX);
            this.state = 266;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 265;
                this.match(CypherParser.SP);
                }
            }

            this.state = 296;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.FOR:
                {
                {
                this.state = 268;
                this.match(CypherParser.FOR);
                this.state = 270;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 269;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 272;
                this.oC_IndexEntity();
                this.state = 274;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 273;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 276;
                this.match(CypherParser.ON);
                this.state = 278;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 277;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 280;
                this.oC_IndexProperties();
                }
                }
                break;
            case CypherParser.ON:
                {
                {
                this.state = 282;
                this.match(CypherParser.ON);
                this.state = 284;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 283;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 286;
                this.match(CypherParser.T__1);
                this.state = 288;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 287;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 290;
                this.oC_LabelName();
                this.state = 292;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 291;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 294;
                this.oC_IndexProperties();
                }
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
    public oC_DropIndex(): OC_DropIndexContext {
        let localContext = new OC_DropIndexContext(this.context, this.state);
        this.enterRule(localContext, 10, CypherParser.RULE_oC_DropIndex);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 298;
            this.match(CypherParser.DROP);
            this.state = 299;
            this.match(CypherParser.SP);
            this.state = 302;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 48) {
                {
                this.state = 300;
                this.match(CypherParser.FULLTEXT);
                this.state = 301;
                this.match(CypherParser.SP);
                }
            }

            this.state = 304;
            this.match(CypherParser.INDEX);
            this.state = 306;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 305;
                this.match(CypherParser.SP);
                }
            }

            this.state = 336;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.FOR:
                {
                {
                this.state = 308;
                this.match(CypherParser.FOR);
                this.state = 310;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 309;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 312;
                this.oC_IndexEntity();
                this.state = 314;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 313;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 316;
                this.match(CypherParser.ON);
                this.state = 318;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 317;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 320;
                this.oC_IndexProperties();
                }
                }
                break;
            case CypherParser.ON:
                {
                {
                this.state = 322;
                this.match(CypherParser.ON);
                this.state = 324;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 323;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 326;
                this.match(CypherParser.T__1);
                this.state = 328;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 327;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 330;
                this.oC_LabelName();
                this.state = 332;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 331;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 334;
                this.oC_IndexProperties();
                }
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
    public oC_IndexEntity(): OC_IndexEntityContext {
        let localContext = new OC_IndexEntityContext(this.context, this.state);
        this.enterRule(localContext, 12, CypherParser.RULE_oC_IndexEntity);
        try {
            this.state = 340;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 24, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 338;
                this.oC_NodePattern();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 339;
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
        this.enterRule(localContext, 14, CypherParser.RULE_oC_IndexProperties);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 342;
            this.match(CypherParser.T__2);
            this.state = 344;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 343;
                this.match(CypherParser.SP);
                }
            }

            this.state = 346;
            this.oC_Expression();
            this.state = 357;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 28, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 348;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 347;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 350;
                    this.match(CypherParser.T__3);
                    this.state = 352;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 351;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 354;
                    this.oC_Expression();
                    }
                    }
                }
                this.state = 359;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 28, this.context);
            }
            this.state = 361;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 360;
                this.match(CypherParser.SP);
                }
            }

            this.state = 363;
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
        this.enterRule(localContext, 16, CypherParser.RULE_oC_CreateConstraint);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 365;
            this.match(CypherParser.CREATE);
            this.state = 366;
            this.match(CypherParser.SP);
            this.state = 367;
            this.match(CypherParser.CONSTRAINT);
            this.state = 368;
            this.match(CypherParser.SP);
            this.state = 369;
            this.match(CypherParser.ON);
            this.state = 371;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 370;
                this.match(CypherParser.SP);
                }
            }

            this.state = 373;
            this.oC_IndexEntity();
            this.state = 374;
            this.match(CypherParser.SP);
            this.state = 375;
            this.match(CypherParser.ASSERT);
            this.state = 376;
            this.match(CypherParser.SP);
            this.state = 377;
            this.oC_Expression();
            this.state = 388;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 33, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 379;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 378;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 381;
                    this.match(CypherParser.T__3);
                    this.state = 383;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 382;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 385;
                    this.oC_Expression();
                    }
                    }
                }
                this.state = 390;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 33, this.context);
            }
            this.state = 393;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 34, this.context) ) {
            case 1:
                {
                this.state = 391;
                this.match(CypherParser.SP);
                this.state = 392;
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
        this.enterRule(localContext, 18, CypherParser.RULE_oC_DropConstraint);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 395;
            this.match(CypherParser.DROP);
            this.state = 396;
            this.match(CypherParser.SP);
            this.state = 397;
            this.match(CypherParser.CONSTRAINT);
            this.state = 398;
            this.match(CypherParser.SP);
            this.state = 399;
            this.match(CypherParser.ON);
            this.state = 401;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 400;
                this.match(CypherParser.SP);
                }
            }

            this.state = 403;
            this.oC_IndexEntity();
            this.state = 404;
            this.match(CypherParser.SP);
            this.state = 405;
            this.match(CypherParser.ASSERT);
            this.state = 406;
            this.match(CypherParser.SP);
            this.state = 407;
            this.oC_Expression();
            this.state = 418;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 38, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 409;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 408;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 411;
                    this.match(CypherParser.T__3);
                    this.state = 413;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 412;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 415;
                    this.oC_Expression();
                    }
                    }
                }
                this.state = 420;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 38, this.context);
            }
            this.state = 423;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 39, this.context) ) {
            case 1:
                {
                this.state = 421;
                this.match(CypherParser.SP);
                this.state = 422;
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
        this.enterRule(localContext, 20, CypherParser.RULE_oC_ConstraintPredicate);
        try {
            this.state = 433;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 40, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 425;
                this.match(CypherParser.IS);
                this.state = 426;
                this.match(CypherParser.SP);
                this.state = 427;
                this.match(CypherParser.UNIQUE);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 428;
                this.match(CypherParser.IS);
                this.state = 429;
                this.match(CypherParser.SP);
                this.state = 430;
                this.match(CypherParser.NOT);
                this.state = 431;
                this.match(CypherParser.SP);
                this.state = 432;
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
        this.enterRule(localContext, 22, CypherParser.RULE_oC_RegularQuery);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 435;
            this.oC_SingleQuery();
            this.state = 442;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 42, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 437;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 436;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 439;
                    this.oC_Union();
                    }
                    }
                }
                this.state = 444;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 42, this.context);
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
        this.enterRule(localContext, 24, CypherParser.RULE_oC_Union);
        let _la: number;
        try {
            this.state = 457;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 45, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 445;
                this.match(CypherParser.UNION);
                this.state = 446;
                this.match(CypherParser.SP);
                this.state = 447;
                this.match(CypherParser.ALL);
                this.state = 449;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 448;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 451;
                this.oC_SingleQuery();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 452;
                this.match(CypherParser.UNION);
                this.state = 454;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 453;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 456;
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
        this.enterRule(localContext, 26, CypherParser.RULE_oC_SingleQuery);
        try {
            this.state = 461;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 46, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 459;
                this.oC_SinglePartQuery();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 460;
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
        this.enterRule(localContext, 28, CypherParser.RULE_oC_SinglePartQuery);
        let _la: number;
        try {
            let alternative: number;
            this.state = 498;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 55, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 469;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (((((_la - 52)) & ~0x1F) === 0 && ((1 << (_la - 52)) & 2055) !== 0)) {
                    {
                    {
                    this.state = 463;
                    this.oC_ReadingClause();
                    this.state = 465;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 464;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 471;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 472;
                this.oC_Return();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 479;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 50, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 473;
                        this.oC_ReadingClause();
                        this.state = 475;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 132) {
                            {
                            this.state = 474;
                            this.match(CypherParser.SP);
                            }
                        }

                        }
                        }
                    }
                    this.state = 481;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 50, this.context);
                }
                this.state = 482;
                this.oC_UpdatingClause();
                this.state = 489;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 52, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 484;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 132) {
                            {
                            this.state = 483;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 486;
                        this.oC_UpdatingClause();
                        }
                        }
                    }
                    this.state = 491;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 52, this.context);
                }
                this.state = 496;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 54, this.context) ) {
                case 1:
                    {
                    this.state = 493;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 492;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 495;
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
        this.enterRule(localContext, 30, CypherParser.RULE_oC_MultiPartQuery);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 522;
            this.errorHandler.sync(this);
            alternative = 1;
            do {
                switch (alternative) {
                case 1:
                    {
                    {
                    this.state = 506;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 57, this.context);
                    while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                        if (alternative === 1) {
                            {
                            {
                            this.state = 500;
                            this.oC_ReadingClause();
                            this.state = 502;
                            this.errorHandler.sync(this);
                            _la = this.tokenStream.LA(1);
                            if (_la === 132) {
                                {
                                this.state = 501;
                                this.match(CypherParser.SP);
                                }
                            }

                            }
                            }
                        }
                        this.state = 508;
                        this.errorHandler.sync(this);
                        alternative = this.interpreter.adaptivePredict(this.tokenStream, 57, this.context);
                    }
                    this.state = 515;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    while (((((_la - 51)) & ~0x1F) === 0 && ((1 << (_la - 51)) & 8097) !== 0)) {
                        {
                        {
                        this.state = 509;
                        this.oC_UpdatingClause();
                        this.state = 511;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 132) {
                            {
                            this.state = 510;
                            this.match(CypherParser.SP);
                            }
                        }

                        }
                        }
                        this.state = 517;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                    }
                    this.state = 518;
                    this.oC_With();
                    this.state = 520;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 519;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 524;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 61, this.context);
            } while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER);
            this.state = 526;
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
        this.enterRule(localContext, 32, CypherParser.RULE_oC_UpdatingClause);
        try {
            this.state = 535;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.CREATE:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 528;
                this.oC_Create();
                }
                break;
            case CypherParser.MERGE:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 529;
                this.oC_Merge();
                }
                break;
            case CypherParser.DETACH:
            case CypherParser.DELETE:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 530;
                this.oC_Delete();
                }
                break;
            case CypherParser.SET:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 531;
                this.oC_Set();
                }
                break;
            case CypherParser.REMOVE:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 532;
                this.oC_Remove();
                }
                break;
            case CypherParser.FOREACH:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 533;
                this.oC_Foreach();
                }
                break;
            case CypherParser.CALL:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 534;
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
        this.enterRule(localContext, 34, CypherParser.RULE_oC_ReadingClause);
        try {
            this.state = 541;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 63, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 537;
                this.oC_Match();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 538;
                this.oC_Unwind();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 539;
                this.oC_InQueryCall();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 540;
                this.oC_CallSubquery();
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
    public oC_Foreach(): OC_ForeachContext {
        let localContext = new OC_ForeachContext(this.context, this.state);
        this.enterRule(localContext, 36, CypherParser.RULE_oC_Foreach);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 543;
            this.match(CypherParser.FOREACH);
            this.state = 545;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 544;
                this.match(CypherParser.SP);
                }
            }

            this.state = 547;
            this.match(CypherParser.T__2);
            this.state = 549;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 548;
                this.match(CypherParser.SP);
                }
            }

            this.state = 551;
            this.oC_Variable();
            this.state = 552;
            this.match(CypherParser.SP);
            this.state = 553;
            this.match(CypherParser.IN);
            this.state = 554;
            this.match(CypherParser.SP);
            this.state = 555;
            this.oC_Expression();
            this.state = 557;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 556;
                this.match(CypherParser.SP);
                }
            }

            this.state = 559;
            this.match(CypherParser.T__5);
            this.state = 564;
            this.errorHandler.sync(this);
            alternative = 1;
            do {
                switch (alternative) {
                case 1:
                    {
                    {
                    this.state = 561;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 560;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 563;
                    this.oC_UpdatingClause();
                    }
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 566;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 68, this.context);
            } while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER);
            this.state = 569;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 568;
                this.match(CypherParser.SP);
                }
            }

            this.state = 571;
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
        this.enterRule(localContext, 38, CypherParser.RULE_oC_CallSubquery);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 573;
            this.match(CypherParser.CALL);
            this.state = 575;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 574;
                this.match(CypherParser.SP);
                }
            }

            this.state = 577;
            this.match(CypherParser.T__6);
            this.state = 579;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 578;
                this.match(CypherParser.SP);
                }
            }

            this.state = 581;
            this.oC_RegularQuery();
            this.state = 583;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 582;
                this.match(CypherParser.SP);
                }
            }

            this.state = 585;
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
        this.enterRule(localContext, 40, CypherParser.RULE_oC_Match);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 589;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 52) {
                {
                this.state = 587;
                this.match(CypherParser.OPTIONAL);
                this.state = 588;
                this.match(CypherParser.SP);
                }
            }

            this.state = 591;
            this.match(CypherParser.MATCH);
            this.state = 593;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 592;
                this.match(CypherParser.SP);
                }
            }

            this.state = 595;
            this.oC_Pattern();
            this.state = 600;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 76, this.context) ) {
            case 1:
                {
                this.state = 597;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 596;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 599;
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
        this.enterRule(localContext, 42, CypherParser.RULE_oC_Unwind);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 602;
            this.match(CypherParser.UNWIND);
            this.state = 604;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 603;
                this.match(CypherParser.SP);
                }
            }

            this.state = 606;
            this.oC_Expression();
            this.state = 607;
            this.match(CypherParser.SP);
            this.state = 608;
            this.match(CypherParser.AS);
            this.state = 609;
            this.match(CypherParser.SP);
            this.state = 610;
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
        this.enterRule(localContext, 44, CypherParser.RULE_oC_Merge);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 612;
            this.match(CypherParser.MERGE);
            this.state = 614;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 613;
                this.match(CypherParser.SP);
                }
            }

            this.state = 616;
            this.oC_PatternPart();
            this.state = 621;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 79, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 617;
                    this.match(CypherParser.SP);
                    this.state = 618;
                    this.oC_MergeAction();
                    }
                    }
                }
                this.state = 623;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 79, this.context);
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
        this.enterRule(localContext, 46, CypherParser.RULE_oC_MergeAction);
        try {
            this.state = 634;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 80, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 624;
                this.match(CypherParser.ON);
                this.state = 625;
                this.match(CypherParser.SP);
                this.state = 626;
                this.match(CypherParser.MATCH);
                this.state = 627;
                this.match(CypherParser.SP);
                this.state = 628;
                this.oC_Set();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 629;
                this.match(CypherParser.ON);
                this.state = 630;
                this.match(CypherParser.SP);
                this.state = 631;
                this.match(CypherParser.CREATE);
                this.state = 632;
                this.match(CypherParser.SP);
                this.state = 633;
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
        this.enterRule(localContext, 48, CypherParser.RULE_oC_Create);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 636;
            this.match(CypherParser.CREATE);
            this.state = 638;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 637;
                this.match(CypherParser.SP);
                }
            }

            this.state = 640;
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
        this.enterRule(localContext, 50, CypherParser.RULE_oC_Set);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 642;
            this.match(CypherParser.SET);
            this.state = 644;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 643;
                this.match(CypherParser.SP);
                }
            }

            this.state = 646;
            this.oC_SetItem();
            this.state = 657;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 85, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 648;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 647;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 650;
                    this.match(CypherParser.T__3);
                    this.state = 652;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 651;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 654;
                    this.oC_SetItem();
                    }
                    }
                }
                this.state = 659;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 85, this.context);
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
        this.enterRule(localContext, 52, CypherParser.RULE_oC_SetItem);
        let _la: number;
        try {
            this.state = 696;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 93, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 660;
                this.oC_PropertyExpression();
                this.state = 662;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 661;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 664;
                this.match(CypherParser.T__8);
                this.state = 666;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 665;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 668;
                this.oC_Expression();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 670;
                this.oC_Variable();
                this.state = 672;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 671;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 674;
                this.match(CypherParser.T__8);
                this.state = 676;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 675;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 678;
                this.oC_Expression();
                }
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                {
                this.state = 680;
                this.oC_Variable();
                this.state = 682;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 681;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 684;
                this.match(CypherParser.T__9);
                this.state = 686;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 685;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 688;
                this.oC_Expression();
                }
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 690;
                this.oC_Variable();
                this.state = 692;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 691;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 694;
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
        this.enterRule(localContext, 54, CypherParser.RULE_oC_Delete);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 700;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 60) {
                {
                this.state = 698;
                this.match(CypherParser.DETACH);
                this.state = 699;
                this.match(CypherParser.SP);
                }
            }

            this.state = 702;
            this.match(CypherParser.DELETE);
            this.state = 704;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 703;
                this.match(CypherParser.SP);
                }
            }

            this.state = 706;
            this.oC_Expression();
            this.state = 717;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 98, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 708;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 707;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 710;
                    this.match(CypherParser.T__3);
                    this.state = 712;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 711;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 714;
                    this.oC_Expression();
                    }
                    }
                }
                this.state = 719;
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
    public oC_Remove(): OC_RemoveContext {
        let localContext = new OC_RemoveContext(this.context, this.state);
        this.enterRule(localContext, 56, CypherParser.RULE_oC_Remove);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 720;
            this.match(CypherParser.REMOVE);
            this.state = 721;
            this.match(CypherParser.SP);
            this.state = 722;
            this.oC_RemoveItem();
            this.state = 733;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 101, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 724;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 723;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 726;
                    this.match(CypherParser.T__3);
                    this.state = 728;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 727;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 730;
                    this.oC_RemoveItem();
                    }
                    }
                }
                this.state = 735;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 101, this.context);
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
        this.enterRule(localContext, 58, CypherParser.RULE_oC_RemoveItem);
        try {
            this.state = 740;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 102, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 736;
                this.oC_Variable();
                this.state = 737;
                this.oC_NodeLabels();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 739;
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
        this.enterRule(localContext, 60, CypherParser.RULE_oC_InQueryCall);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 742;
            this.match(CypherParser.CALL);
            this.state = 743;
            this.match(CypherParser.SP);
            this.state = 744;
            this.oC_ExplicitProcedureInvocation();
            this.state = 751;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 104, this.context) ) {
            case 1:
                {
                this.state = 746;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 745;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 748;
                this.match(CypherParser.YIELD);
                this.state = 749;
                this.match(CypherParser.SP);
                this.state = 750;
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
        this.enterRule(localContext, 62, CypherParser.RULE_oC_StandaloneCall);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 753;
            this.match(CypherParser.CALL);
            this.state = 754;
            this.match(CypherParser.SP);
            this.state = 757;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 105, this.context) ) {
            case 1:
                {
                this.state = 755;
                this.oC_ExplicitProcedureInvocation();
                }
                break;
            case 2:
                {
                this.state = 756;
                this.oC_ImplicitProcedureInvocation();
                }
                break;
            }
            this.state = 768;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 108, this.context) ) {
            case 1:
                {
                this.state = 760;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 759;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 762;
                this.match(CypherParser.YIELD);
                this.state = 763;
                this.match(CypherParser.SP);
                this.state = 766;
                this.errorHandler.sync(this);
                switch (this.tokenStream.LA(1)) {
                case CypherParser.T__10:
                    {
                    this.state = 764;
                    this.match(CypherParser.T__10);
                    }
                    break;
                case CypherParser.INDEX:
                case CypherParser.ASSERT:
                case CypherParser.FULLTEXT:
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
                    this.state = 765;
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
        this.enterRule(localContext, 64, CypherParser.RULE_oC_YieldItems);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 770;
            this.oC_YieldItem();
            this.state = 781;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 111, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 772;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 771;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 774;
                    this.match(CypherParser.T__3);
                    this.state = 776;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 775;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 778;
                    this.oC_YieldItem();
                    }
                    }
                }
                this.state = 783;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 111, this.context);
            }
            this.state = 788;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 113, this.context) ) {
            case 1:
                {
                this.state = 785;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 784;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 787;
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
        this.enterRule(localContext, 66, CypherParser.RULE_oC_YieldItem);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 795;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 114, this.context) ) {
            case 1:
                {
                this.state = 790;
                this.oC_ProcedureResultField();
                this.state = 791;
                this.match(CypherParser.SP);
                this.state = 792;
                this.match(CypherParser.AS);
                this.state = 793;
                this.match(CypherParser.SP);
                }
                break;
            }
            this.state = 797;
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
        this.enterRule(localContext, 68, CypherParser.RULE_oC_With);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 799;
            this.match(CypherParser.WITH);
            this.state = 800;
            this.oC_ProjectionBody();
            this.state = 805;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 116, this.context) ) {
            case 1:
                {
                this.state = 802;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 801;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 804;
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
        this.enterRule(localContext, 70, CypherParser.RULE_oC_Return);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 807;
            this.match(CypherParser.RETURN);
            this.state = 808;
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
        this.enterRule(localContext, 72, CypherParser.RULE_oC_ProjectionBody);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 814;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 118, this.context) ) {
            case 1:
                {
                this.state = 811;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 810;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 813;
                this.match(CypherParser.DISTINCT);
                }
                break;
            }
            this.state = 816;
            this.match(CypherParser.SP);
            this.state = 817;
            this.oC_ProjectionItems();
            this.state = 820;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 119, this.context) ) {
            case 1:
                {
                this.state = 818;
                this.match(CypherParser.SP);
                this.state = 819;
                this.oC_Order();
                }
                break;
            }
            this.state = 824;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 120, this.context) ) {
            case 1:
                {
                this.state = 822;
                this.match(CypherParser.SP);
                this.state = 823;
                this.oC_Skip();
                }
                break;
            }
            this.state = 828;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 121, this.context) ) {
            case 1:
                {
                this.state = 826;
                this.match(CypherParser.SP);
                this.state = 827;
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
        this.enterRule(localContext, 74, CypherParser.RULE_oC_ProjectionItems);
        let _la: number;
        try {
            let alternative: number;
            this.state = 858;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.T__10:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 830;
                this.match(CypherParser.T__10);
                this.state = 841;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 124, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 832;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 132) {
                            {
                            this.state = 831;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 834;
                        this.match(CypherParser.T__3);
                        this.state = 836;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 132) {
                            {
                            this.state = 835;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 838;
                        this.oC_ProjectionItem();
                        }
                        }
                    }
                    this.state = 843;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 124, this.context);
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
            case CypherParser.ALL:
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
                this.state = 844;
                this.oC_ProjectionItem();
                this.state = 855;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 127, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 846;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 132) {
                            {
                            this.state = 845;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 848;
                        this.match(CypherParser.T__3);
                        this.state = 850;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 132) {
                            {
                            this.state = 849;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 852;
                        this.oC_ProjectionItem();
                        }
                        }
                    }
                    this.state = 857;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 127, this.context);
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
        this.enterRule(localContext, 76, CypherParser.RULE_oC_ProjectionItem);
        try {
            this.state = 867;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 129, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 860;
                this.oC_Expression();
                this.state = 861;
                this.match(CypherParser.SP);
                this.state = 862;
                this.match(CypherParser.AS);
                this.state = 863;
                this.match(CypherParser.SP);
                this.state = 864;
                this.oC_Variable();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 866;
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
        this.enterRule(localContext, 78, CypherParser.RULE_oC_Order);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 869;
            this.match(CypherParser.ORDER);
            this.state = 870;
            this.match(CypherParser.SP);
            this.state = 871;
            this.match(CypherParser.BY);
            this.state = 872;
            this.match(CypherParser.SP);
            this.state = 873;
            this.oC_SortItem();
            this.state = 881;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 4) {
                {
                {
                this.state = 874;
                this.match(CypherParser.T__3);
                this.state = 876;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 875;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 878;
                this.oC_SortItem();
                }
                }
                this.state = 883;
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
        this.enterRule(localContext, 80, CypherParser.RULE_oC_Skip);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 884;
            this.match(CypherParser.L_SKIP);
            this.state = 885;
            this.match(CypherParser.SP);
            this.state = 886;
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
        this.enterRule(localContext, 82, CypherParser.RULE_oC_Limit);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 888;
            this.match(CypherParser.LIMIT);
            this.state = 889;
            this.match(CypherParser.SP);
            this.state = 890;
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
        this.enterRule(localContext, 84, CypherParser.RULE_oC_SortItem);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 892;
            this.oC_Expression();
            this.state = 897;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 133, this.context) ) {
            case 1:
                {
                this.state = 894;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 893;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 896;
                _la = this.tokenStream.LA(1);
                if(!(((((_la - 72)) & ~0x1F) === 0 && ((1 << (_la - 72)) & 15) !== 0))) {
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
        this.enterRule(localContext, 86, CypherParser.RULE_oC_Where);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 899;
            this.match(CypherParser.WHERE);
            this.state = 900;
            this.match(CypherParser.SP);
            this.state = 901;
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
        this.enterRule(localContext, 88, CypherParser.RULE_oC_Pattern);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 903;
            this.oC_PatternPart();
            this.state = 914;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 136, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 905;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 904;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 907;
                    this.match(CypherParser.T__3);
                    this.state = 909;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 908;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 911;
                    this.oC_PatternPart();
                    }
                    }
                }
                this.state = 916;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 136, this.context);
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
        this.enterRule(localContext, 90, CypherParser.RULE_oC_PatternPart);
        let _la: number;
        try {
            this.state = 928;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 139, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 917;
                this.oC_Variable();
                this.state = 919;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 918;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 921;
                this.match(CypherParser.T__8);
                this.state = 923;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 922;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 925;
                this.oC_AnonymousPatternPart();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 927;
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
        this.enterRule(localContext, 92, CypherParser.RULE_oC_AnonymousPatternPart);
        try {
            this.state = 932;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.SHORTESTPATH:
            case CypherParser.ALLSHORTESTPATHS:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 930;
                this.oC_ShortestPathPattern();
                }
                break;
            case CypherParser.T__2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 931;
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
        this.enterRule(localContext, 94, CypherParser.RULE_oC_ShortestPathPattern);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 934;
            _la = this.tokenStream.LA(1);
            if(!(_la === 77 || _la === 78)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            this.state = 936;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 935;
                this.match(CypherParser.SP);
                }
            }

            this.state = 938;
            this.match(CypherParser.T__2);
            this.state = 940;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 939;
                this.match(CypherParser.SP);
                }
            }

            this.state = 942;
            this.oC_PatternElement();
            this.state = 944;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 943;
                this.match(CypherParser.SP);
                }
            }

            this.state = 946;
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
        this.enterRule(localContext, 96, CypherParser.RULE_oC_PatternElement);
        let _la: number;
        try {
            let alternative: number;
            this.state = 962;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 146, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 948;
                this.oC_NodePattern();
                this.state = 955;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 145, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 950;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 132) {
                            {
                            this.state = 949;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 952;
                        this.oC_PatternElementChain();
                        }
                        }
                    }
                    this.state = 957;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 145, this.context);
                }
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 958;
                this.match(CypherParser.T__2);
                this.state = 959;
                this.oC_PatternElement();
                this.state = 960;
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
        this.enterRule(localContext, 98, CypherParser.RULE_oC_RelationshipsPattern);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 964;
            this.oC_NodePattern();
            this.state = 969;
            this.errorHandler.sync(this);
            alternative = 1;
            do {
                switch (alternative) {
                case 1:
                    {
                    {
                    this.state = 966;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 965;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 968;
                    this.oC_PatternElementChain();
                    }
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 971;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 148, this.context);
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
        this.enterRule(localContext, 100, CypherParser.RULE_oC_NodePattern);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 973;
            this.match(CypherParser.T__2);
            this.state = 975;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 974;
                this.match(CypherParser.SP);
                }
            }

            this.state = 981;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 2147549191) !== 0) || ((((_la - 78)) & ~0x1F) === 0 && ((1 << (_la - 78)) & 136185857) !== 0) || ((((_la - 125)) & ~0x1F) === 0 && ((1 << (_la - 125)) & 79) !== 0)) {
                {
                this.state = 977;
                this.oC_Variable();
                this.state = 979;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 978;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 987;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 2) {
                {
                this.state = 983;
                this.oC_NodeLabels();
                this.state = 985;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 984;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 993;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 7 || _la === 26) {
                {
                this.state = 989;
                this.oC_Properties();
                this.state = 991;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 990;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 995;
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
        this.enterRule(localContext, 102, CypherParser.RULE_oC_PatternElementChain);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 997;
            this.oC_RelationshipPattern();
            this.state = 999;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 998;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1001;
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
        this.enterRule(localContext, 104, CypherParser.RULE_oC_RelationshipPattern);
        let _la: number;
        try {
            this.state = 1067;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 173, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1003;
                this.oC_LeftArrowHead();
                this.state = 1005;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1004;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1007;
                this.oC_Dash();
                this.state = 1009;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 158, this.context) ) {
                case 1:
                    {
                    this.state = 1008;
                    this.match(CypherParser.SP);
                    }
                    break;
                }
                this.state = 1012;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 12) {
                    {
                    this.state = 1011;
                    this.oC_RelationshipDetail();
                    }
                }

                this.state = 1015;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1014;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1017;
                this.oC_Dash();
                this.state = 1019;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1018;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1021;
                this.oC_RightArrowHead();
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1023;
                this.oC_LeftArrowHead();
                this.state = 1025;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1024;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1027;
                this.oC_Dash();
                this.state = 1029;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 163, this.context) ) {
                case 1:
                    {
                    this.state = 1028;
                    this.match(CypherParser.SP);
                    }
                    break;
                }
                this.state = 1032;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 12) {
                    {
                    this.state = 1031;
                    this.oC_RelationshipDetail();
                    }
                }

                this.state = 1035;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1034;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1037;
                this.oC_Dash();
                }
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                {
                this.state = 1039;
                this.oC_Dash();
                this.state = 1041;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 166, this.context) ) {
                case 1:
                    {
                    this.state = 1040;
                    this.match(CypherParser.SP);
                    }
                    break;
                }
                this.state = 1044;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 12) {
                    {
                    this.state = 1043;
                    this.oC_RelationshipDetail();
                    }
                }

                this.state = 1047;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1046;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1049;
                this.oC_Dash();
                this.state = 1051;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1050;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1053;
                this.oC_RightArrowHead();
                }
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 1055;
                this.oC_Dash();
                this.state = 1057;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 170, this.context) ) {
                case 1:
                    {
                    this.state = 1056;
                    this.match(CypherParser.SP);
                    }
                    break;
                }
                this.state = 1060;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 12) {
                    {
                    this.state = 1059;
                    this.oC_RelationshipDetail();
                    }
                }

                this.state = 1063;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1062;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1065;
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
        this.enterRule(localContext, 106, CypherParser.RULE_oC_RelationshipDetail);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1069;
            this.match(CypherParser.T__11);
            this.state = 1071;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1070;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1077;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 2147549191) !== 0) || ((((_la - 78)) & ~0x1F) === 0 && ((1 << (_la - 78)) & 136185857) !== 0) || ((((_la - 125)) & ~0x1F) === 0 && ((1 << (_la - 125)) & 79) !== 0)) {
                {
                this.state = 1073;
                this.oC_Variable();
                this.state = 1075;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1074;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1083;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 2) {
                {
                this.state = 1079;
                this.oC_RelationshipTypes();
                this.state = 1081;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1080;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1086;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 11) {
                {
                this.state = 1085;
                this.oC_RangeLiteral();
                }
            }

            this.state = 1092;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 7 || _la === 26) {
                {
                this.state = 1088;
                this.oC_Properties();
                this.state = 1090;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1089;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1094;
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
        this.enterRule(localContext, 108, CypherParser.RULE_oC_Properties);
        try {
            this.state = 1098;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.T__6:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1096;
                this.oC_MapLiteral();
                }
                break;
            case CypherParser.T__25:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1097;
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
        this.enterRule(localContext, 110, CypherParser.RULE_oC_RelationshipTypes);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1100;
            this.match(CypherParser.T__1);
            this.state = 1102;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1101;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1104;
            this.oC_RelTypeName();
            this.state = 1118;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 187, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1106;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 1105;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1108;
                    this.match(CypherParser.T__5);
                    this.state = 1110;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 2) {
                        {
                        this.state = 1109;
                        this.match(CypherParser.T__1);
                        }
                    }

                    this.state = 1113;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 1112;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1115;
                    this.oC_RelTypeName();
                    }
                    }
                }
                this.state = 1120;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 187, this.context);
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
        this.enterRule(localContext, 112, CypherParser.RULE_oC_NodeLabels);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1121;
            this.oC_NodeLabel();
            this.state = 1128;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 189, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1123;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 1122;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1125;
                    this.oC_NodeLabel();
                    }
                    }
                }
                this.state = 1130;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 189, this.context);
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
        this.enterRule(localContext, 114, CypherParser.RULE_oC_NodeLabel);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1131;
            this.match(CypherParser.T__1);
            this.state = 1133;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1132;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1135;
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
        this.enterRule(localContext, 116, CypherParser.RULE_oC_RangeLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1137;
            this.match(CypherParser.T__10);
            this.state = 1139;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1138;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1145;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 102)) & ~0x1F) === 0 && ((1 << (_la - 102)) & 7) !== 0)) {
                {
                this.state = 1141;
                this.oC_IntegerLiteral();
                this.state = 1143;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1142;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1157;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 14) {
                {
                this.state = 1147;
                this.match(CypherParser.T__13);
                this.state = 1149;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1148;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1155;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (((((_la - 102)) & ~0x1F) === 0 && ((1 << (_la - 102)) & 7) !== 0)) {
                    {
                    this.state = 1151;
                    this.oC_IntegerLiteral();
                    this.state = 1153;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 1152;
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
        this.enterRule(localContext, 118, CypherParser.RULE_oC_LabelName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1159;
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
        this.enterRule(localContext, 120, CypherParser.RULE_oC_RelTypeName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1161;
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
        this.enterRule(localContext, 122, CypherParser.RULE_oC_PropertyExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1163;
            this.oC_Atom();
            this.state = 1168;
            this.errorHandler.sync(this);
            alternative = 1;
            do {
                switch (alternative) {
                case 1:
                    {
                    {
                    this.state = 1165;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 1164;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1167;
                    this.oC_PropertyLookup();
                    }
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 1170;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 199, this.context);
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
        this.enterRule(localContext, 124, CypherParser.RULE_oC_Expression);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1172;
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
        this.enterRule(localContext, 126, CypherParser.RULE_oC_OrExpression);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1174;
            this.oC_XorExpression();
            this.state = 1181;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 200, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1175;
                    this.match(CypherParser.SP);
                    this.state = 1176;
                    this.match(CypherParser.OR);
                    this.state = 1177;
                    this.match(CypherParser.SP);
                    this.state = 1178;
                    this.oC_XorExpression();
                    }
                    }
                }
                this.state = 1183;
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
    public oC_XorExpression(): OC_XorExpressionContext {
        let localContext = new OC_XorExpressionContext(this.context, this.state);
        this.enterRule(localContext, 128, CypherParser.RULE_oC_XorExpression);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1184;
            this.oC_AndExpression();
            this.state = 1191;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 201, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1185;
                    this.match(CypherParser.SP);
                    this.state = 1186;
                    this.match(CypherParser.XOR);
                    this.state = 1187;
                    this.match(CypherParser.SP);
                    this.state = 1188;
                    this.oC_AndExpression();
                    }
                    }
                }
                this.state = 1193;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 201, this.context);
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
        this.enterRule(localContext, 130, CypherParser.RULE_oC_AndExpression);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1194;
            this.oC_NotExpression();
            this.state = 1201;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 202, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1195;
                    this.match(CypherParser.SP);
                    this.state = 1196;
                    this.match(CypherParser.AND);
                    this.state = 1197;
                    this.match(CypherParser.SP);
                    this.state = 1198;
                    this.oC_NotExpression();
                    }
                    }
                }
                this.state = 1203;
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
    public oC_NotExpression(): OC_NotExpressionContext {
        let localContext = new OC_NotExpressionContext(this.context, this.state);
        this.enterRule(localContext, 132, CypherParser.RULE_oC_NotExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1210;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 82) {
                {
                {
                this.state = 1204;
                this.match(CypherParser.NOT);
                this.state = 1206;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1205;
                    this.match(CypherParser.SP);
                    }
                }

                }
                }
                this.state = 1212;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 1213;
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
        this.enterRule(localContext, 134, CypherParser.RULE_oC_ComparisonExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1215;
            this.oC_StringListNullPredicateExpression();
            this.state = 1222;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 206, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1217;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 1216;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1219;
                    this.oC_PartialComparisonExpression();
                    }
                    }
                }
                this.state = 1224;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 206, this.context);
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
        this.enterRule(localContext, 136, CypherParser.RULE_oC_PartialComparisonExpression);
        let _la: number;
        try {
            this.state = 1255;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.T__8:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1225;
                this.match(CypherParser.T__8);
                this.state = 1227;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1226;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1229;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__14:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1230;
                this.match(CypherParser.T__14);
                this.state = 1232;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1231;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1234;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__15:
                this.enterOuterAlt(localContext, 3);
                {
                {
                this.state = 1235;
                this.match(CypherParser.T__15);
                this.state = 1237;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1236;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1239;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__16:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 1240;
                this.match(CypherParser.T__16);
                this.state = 1242;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1241;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1244;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__17:
                this.enterOuterAlt(localContext, 5);
                {
                {
                this.state = 1245;
                this.match(CypherParser.T__17);
                this.state = 1247;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1246;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1249;
                this.oC_StringListNullPredicateExpression();
                }
                }
                break;
            case CypherParser.T__18:
                this.enterOuterAlt(localContext, 6);
                {
                {
                this.state = 1250;
                this.match(CypherParser.T__18);
                this.state = 1252;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1251;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1254;
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
        this.enterRule(localContext, 138, CypherParser.RULE_oC_StringListNullPredicateExpression);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1257;
            this.oC_AddOrSubtractExpression();
            this.state = 1263;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 215, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    this.state = 1261;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 214, this.context) ) {
                    case 1:
                        {
                        this.state = 1258;
                        this.oC_StringPredicateExpression();
                        }
                        break;
                    case 2:
                        {
                        this.state = 1259;
                        this.oC_ListPredicateExpression();
                        }
                        break;
                    case 3:
                        {
                        this.state = 1260;
                        this.oC_NullPredicateExpression();
                        }
                        break;
                    }
                    }
                }
                this.state = 1265;
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
    public oC_StringPredicateExpression(): OC_StringPredicateExpressionContext {
        let localContext = new OC_StringPredicateExpressionContext(this.context, this.state);
        this.enterRule(localContext, 140, CypherParser.RULE_oC_StringPredicateExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1276;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 216, this.context) ) {
            case 1:
                {
                {
                this.state = 1266;
                this.match(CypherParser.SP);
                this.state = 1267;
                this.match(CypherParser.STARTS);
                this.state = 1268;
                this.match(CypherParser.SP);
                this.state = 1269;
                this.match(CypherParser.WITH);
                }
                }
                break;
            case 2:
                {
                {
                this.state = 1270;
                this.match(CypherParser.SP);
                this.state = 1271;
                this.match(CypherParser.ENDS);
                this.state = 1272;
                this.match(CypherParser.SP);
                this.state = 1273;
                this.match(CypherParser.WITH);
                }
                }
                break;
            case 3:
                {
                {
                this.state = 1274;
                this.match(CypherParser.SP);
                this.state = 1275;
                this.match(CypherParser.CONTAINS);
                }
                }
                break;
            }
            this.state = 1279;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1278;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1281;
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
        this.enterRule(localContext, 142, CypherParser.RULE_oC_ListPredicateExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1283;
            this.match(CypherParser.SP);
            this.state = 1284;
            this.match(CypherParser.IN);
            this.state = 1286;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1285;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1288;
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
        this.enterRule(localContext, 144, CypherParser.RULE_oC_NullPredicateExpression);
        try {
            this.state = 1300;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 219, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1290;
                this.match(CypherParser.SP);
                this.state = 1291;
                this.match(CypherParser.IS);
                this.state = 1292;
                this.match(CypherParser.SP);
                this.state = 1293;
                this.match(CypherParser.NULL);
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1294;
                this.match(CypherParser.SP);
                this.state = 1295;
                this.match(CypherParser.IS);
                this.state = 1296;
                this.match(CypherParser.SP);
                this.state = 1297;
                this.match(CypherParser.NOT);
                this.state = 1298;
                this.match(CypherParser.SP);
                this.state = 1299;
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
        this.enterRule(localContext, 146, CypherParser.RULE_oC_AddOrSubtractExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1302;
            this.oC_MultiplyDivideModuloExpression();
            this.state = 1321;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 225, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    this.state = 1319;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 224, this.context) ) {
                    case 1:
                        {
                        {
                        this.state = 1304;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 132) {
                            {
                            this.state = 1303;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1306;
                        this.match(CypherParser.T__19);
                        this.state = 1308;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 132) {
                            {
                            this.state = 1307;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1310;
                        this.oC_MultiplyDivideModuloExpression();
                        }
                        }
                        break;
                    case 2:
                        {
                        {
                        this.state = 1312;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 132) {
                            {
                            this.state = 1311;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1314;
                        this.match(CypherParser.T__20);
                        this.state = 1316;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 132) {
                            {
                            this.state = 1315;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1318;
                        this.oC_MultiplyDivideModuloExpression();
                        }
                        }
                        break;
                    }
                    }
                }
                this.state = 1323;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 225, this.context);
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
        this.enterRule(localContext, 148, CypherParser.RULE_oC_MultiplyDivideModuloExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1324;
            this.oC_PowerOfExpression();
            this.state = 1351;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 233, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    this.state = 1349;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 232, this.context) ) {
                    case 1:
                        {
                        {
                        this.state = 1326;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 132) {
                            {
                            this.state = 1325;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1328;
                        this.match(CypherParser.T__10);
                        this.state = 1330;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 132) {
                            {
                            this.state = 1329;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1332;
                        this.oC_PowerOfExpression();
                        }
                        }
                        break;
                    case 2:
                        {
                        {
                        this.state = 1334;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 132) {
                            {
                            this.state = 1333;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1336;
                        this.match(CypherParser.T__21);
                        this.state = 1338;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 132) {
                            {
                            this.state = 1337;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1340;
                        this.oC_PowerOfExpression();
                        }
                        }
                        break;
                    case 3:
                        {
                        {
                        this.state = 1342;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 132) {
                            {
                            this.state = 1341;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1344;
                        this.match(CypherParser.T__22);
                        this.state = 1346;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 132) {
                            {
                            this.state = 1345;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1348;
                        this.oC_PowerOfExpression();
                        }
                        }
                        break;
                    }
                    }
                }
                this.state = 1353;
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
    public oC_PowerOfExpression(): OC_PowerOfExpressionContext {
        let localContext = new OC_PowerOfExpressionContext(this.context, this.state);
        this.enterRule(localContext, 150, CypherParser.RULE_oC_PowerOfExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1354;
            this.oC_UnaryAddOrSubtractExpression();
            this.state = 1365;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 236, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1356;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 1355;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1358;
                    this.match(CypherParser.T__23);
                    this.state = 1360;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 1359;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1362;
                    this.oC_UnaryAddOrSubtractExpression();
                    }
                    }
                }
                this.state = 1367;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 236, this.context);
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
        this.enterRule(localContext, 152, CypherParser.RULE_oC_UnaryAddOrSubtractExpression);
        let _la: number;
        try {
            this.state = 1374;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.T__2:
            case CypherParser.T__6:
            case CypherParser.T__11:
            case CypherParser.T__25:
            case CypherParser.INDEX:
            case CypherParser.ASSERT:
            case CypherParser.FULLTEXT:
            case CypherParser.ALL:
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
                this.state = 1368;
                this.oC_NonArithmeticOperatorExpression();
                }
                break;
            case CypherParser.T__19:
            case CypherParser.T__20:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1369;
                _la = this.tokenStream.LA(1);
                if(!(_la === 20 || _la === 21)) {
                this.errorHandler.recoverInline(this);
                }
                else {
                    this.errorHandler.reportMatch(this);
                    this.consume();
                }
                this.state = 1371;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1370;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1373;
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
        this.enterRule(localContext, 154, CypherParser.RULE_oC_NonArithmeticOperatorExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1376;
            this.oC_Atom();
            this.state = 1387;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 242, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    this.state = 1385;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 241, this.context) ) {
                    case 1:
                        {
                        {
                        this.state = 1378;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 132) {
                            {
                            this.state = 1377;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1380;
                        this.oC_ListOperatorExpression();
                        }
                        }
                        break;
                    case 2:
                        {
                        {
                        this.state = 1382;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 132) {
                            {
                            this.state = 1381;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1384;
                        this.oC_PropertyLookup();
                        }
                        }
                        break;
                    }
                    }
                }
                this.state = 1389;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 242, this.context);
            }
            this.state = 1394;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 244, this.context) ) {
            case 1:
                {
                this.state = 1391;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1390;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1393;
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
        this.enterRule(localContext, 156, CypherParser.RULE_oC_ListOperatorExpression);
        let _la: number;
        try {
            this.state = 1409;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 247, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1396;
                this.match(CypherParser.T__11);
                this.state = 1397;
                this.oC_Expression();
                this.state = 1398;
                this.match(CypherParser.T__12);
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1400;
                this.match(CypherParser.T__11);
                this.state = 1402;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 70258824) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 2147549207) !== 0) || ((((_la - 78)) & ~0x1F) === 0 && ((1 << (_la - 78)) & 268311569) !== 0) || ((((_la - 112)) & ~0x1F) === 0 && ((1 << (_la - 112)) & 647175) !== 0)) {
                    {
                    this.state = 1401;
                    this.oC_Expression();
                    }
                }

                this.state = 1404;
                this.match(CypherParser.T__13);
                this.state = 1406;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 70258824) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 2147549207) !== 0) || ((((_la - 78)) & ~0x1F) === 0 && ((1 << (_la - 78)) & 268311569) !== 0) || ((((_la - 112)) & ~0x1F) === 0 && ((1 << (_la - 112)) & 647175) !== 0)) {
                    {
                    this.state = 1405;
                    this.oC_Expression();
                    }
                }

                this.state = 1408;
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
        this.enterRule(localContext, 158, CypherParser.RULE_oC_PropertyLookup);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1411;
            this.match(CypherParser.T__24);
            this.state = 1413;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1412;
                this.match(CypherParser.SP);
                }
            }

            {
            this.state = 1415;
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
        this.enterRule(localContext, 160, CypherParser.RULE_oC_Atom);
        let _la: number;
        try {
            this.state = 1443;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 252, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1417;
                this.oC_Literal();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1418;
                this.oC_Parameter();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1419;
                this.oC_CaseExpression();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 1420;
                this.match(CypherParser.COUNT);
                this.state = 1422;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1421;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1424;
                this.match(CypherParser.T__2);
                this.state = 1426;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1425;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1428;
                this.match(CypherParser.T__10);
                this.state = 1430;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1429;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1432;
                this.match(CypherParser.T__4);
                }
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 1433;
                this.oC_ListComprehension();
                }
                break;
            case 6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 1434;
                this.oC_PatternComprehension();
                }
                break;
            case 7:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 1435;
                this.oC_ReduceExpression();
                }
                break;
            case 8:
                this.enterOuterAlt(localContext, 8);
                {
                this.state = 1436;
                this.oC_ShortestPathPattern();
                }
                break;
            case 9:
                this.enterOuterAlt(localContext, 9);
                {
                this.state = 1437;
                this.oC_Quantifier();
                }
                break;
            case 10:
                this.enterOuterAlt(localContext, 10);
                {
                this.state = 1438;
                this.oC_PatternPredicate();
                }
                break;
            case 11:
                this.enterOuterAlt(localContext, 11);
                {
                this.state = 1439;
                this.oC_ParenthesizedExpression();
                }
                break;
            case 12:
                this.enterOuterAlt(localContext, 12);
                {
                this.state = 1440;
                this.oC_FunctionInvocation();
                }
                break;
            case 13:
                this.enterOuterAlt(localContext, 13);
                {
                this.state = 1441;
                this.oC_ExistentialSubquery();
                }
                break;
            case 14:
                this.enterOuterAlt(localContext, 14);
                {
                this.state = 1442;
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
        this.enterRule(localContext, 162, CypherParser.RULE_oC_CaseExpression);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1467;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 258, this.context) ) {
            case 1:
                {
                {
                this.state = 1445;
                this.match(CypherParser.CASE);
                this.state = 1450;
                this.errorHandler.sync(this);
                alternative = 1;
                do {
                    switch (alternative) {
                    case 1:
                        {
                        {
                        this.state = 1447;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 132) {
                            {
                            this.state = 1446;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1449;
                        this.oC_CaseAlternative();
                        }
                        }
                        break;
                    default:
                        throw new antlr.NoViableAltException(this);
                    }
                    this.state = 1452;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 254, this.context);
                } while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER);
                }
                }
                break;
            case 2:
                {
                {
                this.state = 1454;
                this.match(CypherParser.CASE);
                this.state = 1456;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1455;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1458;
                this.oC_Expression();
                this.state = 1463;
                this.errorHandler.sync(this);
                alternative = 1;
                do {
                    switch (alternative) {
                    case 1:
                        {
                        {
                        this.state = 1460;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 132) {
                            {
                            this.state = 1459;
                            this.match(CypherParser.SP);
                            }
                        }

                        this.state = 1462;
                        this.oC_CaseAlternative();
                        }
                        }
                        break;
                    default:
                        throw new antlr.NoViableAltException(this);
                    }
                    this.state = 1465;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 257, this.context);
                } while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER);
                }
                }
                break;
            }
            this.state = 1477;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 261, this.context) ) {
            case 1:
                {
                this.state = 1470;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1469;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1472;
                this.match(CypherParser.ELSE);
                this.state = 1474;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1473;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1476;
                this.oC_Expression();
                }
                break;
            }
            this.state = 1480;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1479;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1482;
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
        this.enterRule(localContext, 164, CypherParser.RULE_oC_CaseAlternative);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1484;
            this.match(CypherParser.WHEN);
            this.state = 1486;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1485;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1488;
            this.oC_Expression();
            this.state = 1490;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1489;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1492;
            this.match(CypherParser.THEN);
            this.state = 1494;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1493;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1496;
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
        this.enterRule(localContext, 166, CypherParser.RULE_oC_ListComprehension);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1498;
            this.match(CypherParser.T__11);
            this.state = 1500;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1499;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1502;
            this.oC_FilterExpression();
            this.state = 1511;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 269, this.context) ) {
            case 1:
                {
                this.state = 1504;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1503;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1506;
                this.match(CypherParser.T__5);
                this.state = 1508;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1507;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1510;
                this.oC_Expression();
                }
                break;
            }
            this.state = 1514;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1513;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1516;
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
        this.enterRule(localContext, 168, CypherParser.RULE_oC_PatternComprehension);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1518;
            this.match(CypherParser.T__11);
            this.state = 1520;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1519;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1530;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 2147549191) !== 0) || ((((_la - 78)) & ~0x1F) === 0 && ((1 << (_la - 78)) & 136185857) !== 0) || ((((_la - 125)) & ~0x1F) === 0 && ((1 << (_la - 125)) & 79) !== 0)) {
                {
                this.state = 1522;
                this.oC_Variable();
                this.state = 1524;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1523;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1526;
                this.match(CypherParser.T__8);
                this.state = 1528;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1527;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1532;
            this.oC_RelationshipsPattern();
            this.state = 1534;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1533;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1540;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 76) {
                {
                this.state = 1536;
                this.oC_Where();
                this.state = 1538;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1537;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1542;
            this.match(CypherParser.T__5);
            this.state = 1544;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1543;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1546;
            this.oC_Expression();
            this.state = 1548;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1547;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1550;
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
        this.enterRule(localContext, 170, CypherParser.RULE_oC_Quantifier);
        let _la: number;
        try {
            this.state = 1608;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.ALL:
                this.enterOuterAlt(localContext, 1);
                {
                {
                this.state = 1552;
                this.match(CypherParser.ALL);
                this.state = 1554;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1553;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1556;
                this.match(CypherParser.T__2);
                this.state = 1558;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1557;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1560;
                this.oC_FilterExpression();
                this.state = 1562;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1561;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1564;
                this.match(CypherParser.T__4);
                }
                }
                break;
            case CypherParser.ANY:
                this.enterOuterAlt(localContext, 2);
                {
                {
                this.state = 1566;
                this.match(CypherParser.ANY);
                this.state = 1568;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1567;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1570;
                this.match(CypherParser.T__2);
                this.state = 1572;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1571;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1574;
                this.oC_FilterExpression();
                this.state = 1576;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1575;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1578;
                this.match(CypherParser.T__4);
                }
                }
                break;
            case CypherParser.NONE:
                this.enterOuterAlt(localContext, 3);
                {
                {
                this.state = 1580;
                this.match(CypherParser.NONE);
                this.state = 1582;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1581;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1584;
                this.match(CypherParser.T__2);
                this.state = 1586;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1585;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1588;
                this.oC_FilterExpression();
                this.state = 1590;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1589;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1592;
                this.match(CypherParser.T__4);
                }
                }
                break;
            case CypherParser.SINGLE:
                this.enterOuterAlt(localContext, 4);
                {
                {
                this.state = 1594;
                this.match(CypherParser.SINGLE);
                this.state = 1596;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1595;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1598;
                this.match(CypherParser.T__2);
                this.state = 1600;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1599;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1602;
                this.oC_FilterExpression();
                this.state = 1604;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1603;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1606;
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
        this.enterRule(localContext, 172, CypherParser.RULE_oC_FilterExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1610;
            this.oC_IdInColl();
            this.state = 1615;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 294, this.context) ) {
            case 1:
                {
                this.state = 1612;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1611;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1614;
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
        this.enterRule(localContext, 174, CypherParser.RULE_oC_PatternPredicate);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1617;
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
        this.enterRule(localContext, 176, CypherParser.RULE_oC_ParenthesizedExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1619;
            this.match(CypherParser.T__2);
            this.state = 1621;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1620;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1623;
            this.oC_Expression();
            this.state = 1625;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1624;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1627;
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
        this.enterRule(localContext, 178, CypherParser.RULE_oC_IdInColl);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1629;
            this.oC_Variable();
            this.state = 1630;
            this.match(CypherParser.SP);
            this.state = 1631;
            this.match(CypherParser.IN);
            this.state = 1632;
            this.match(CypherParser.SP);
            this.state = 1633;
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
        this.enterRule(localContext, 180, CypherParser.RULE_oC_ReduceExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1635;
            this.match(CypherParser.REDUCE);
            this.state = 1637;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1636;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1639;
            this.match(CypherParser.T__2);
            this.state = 1641;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1640;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1643;
            this.oC_Variable();
            this.state = 1645;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1644;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1647;
            this.match(CypherParser.T__8);
            this.state = 1649;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1648;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1651;
            this.oC_Expression();
            this.state = 1653;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1652;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1655;
            this.match(CypherParser.T__3);
            this.state = 1657;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1656;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1659;
            this.oC_IdInColl();
            this.state = 1661;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1660;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1663;
            this.match(CypherParser.T__5);
            this.state = 1665;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1664;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1667;
            this.oC_Expression();
            this.state = 1669;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1668;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1671;
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
        this.enterRule(localContext, 182, CypherParser.RULE_oC_FunctionInvocation);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1673;
            this.oC_FunctionName();
            this.state = 1675;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1674;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1677;
            this.match(CypherParser.T__2);
            this.state = 1679;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1678;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1685;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 67) {
                {
                this.state = 1681;
                this.match(CypherParser.DISTINCT);
                this.state = 1683;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1682;
                    this.match(CypherParser.SP);
                    }
                }

                }
            }

            this.state = 1704;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 70258824) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 2147549207) !== 0) || ((((_la - 78)) & ~0x1F) === 0 && ((1 << (_la - 78)) & 268311569) !== 0) || ((((_la - 112)) & ~0x1F) === 0 && ((1 << (_la - 112)) & 647175) !== 0)) {
                {
                this.state = 1687;
                this.oC_Expression();
                this.state = 1689;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1688;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1701;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 4) {
                    {
                    {
                    this.state = 1691;
                    this.match(CypherParser.T__3);
                    this.state = 1693;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 1692;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1695;
                    this.oC_Expression();
                    this.state = 1697;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 1696;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 1703;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            this.state = 1706;
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
        this.enterRule(localContext, 184, CypherParser.RULE_oC_FunctionName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1708;
            this.oC_Namespace();
            this.state = 1709;
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
        this.enterRule(localContext, 186, CypherParser.RULE_oC_ExistentialSubquery);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1711;
            this.match(CypherParser.EXISTS);
            this.state = 1713;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1712;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1715;
            this.match(CypherParser.T__6);
            this.state = 1717;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1716;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1735;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 321, this.context) ) {
            case 1:
                {
                this.state = 1719;
                this.oC_RegularQuery();
                }
                break;
            case 2:
                {
                {
                this.state = 1724;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                do {
                    {
                    {
                    this.state = 1720;
                    this.oC_ReadingClause();
                    this.state = 1722;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 317, this.context) ) {
                    case 1:
                        {
                        this.state = 1721;
                        this.match(CypherParser.SP);
                        }
                        break;
                    }
                    }
                    }
                    this.state = 1726;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                } while (((((_la - 52)) & ~0x1F) === 0 && ((1 << (_la - 52)) & 2055) !== 0));
                }
                }
                break;
            case 3:
                {
                {
                this.state = 1728;
                this.oC_Pattern();
                this.state = 1733;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 320, this.context) ) {
                case 1:
                    {
                    this.state = 1730;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 1729;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1732;
                    this.oC_Where();
                    }
                    break;
                }
                }
                }
                break;
            }
            this.state = 1738;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1737;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1740;
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
        this.enterRule(localContext, 188, CypherParser.RULE_oC_ExplicitProcedureInvocation);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1742;
            this.oC_ProcedureName();
            this.state = 1744;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1743;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1746;
            this.match(CypherParser.T__2);
            this.state = 1748;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1747;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1767;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 70258824) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 2147549207) !== 0) || ((((_la - 78)) & ~0x1F) === 0 && ((1 << (_la - 78)) & 268311569) !== 0) || ((((_la - 112)) & ~0x1F) === 0 && ((1 << (_la - 112)) & 647175) !== 0)) {
                {
                this.state = 1750;
                this.oC_Expression();
                this.state = 1752;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1751;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1764;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 4) {
                    {
                    {
                    this.state = 1754;
                    this.match(CypherParser.T__3);
                    this.state = 1756;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 1755;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1758;
                    this.oC_Expression();
                    this.state = 1760;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 1759;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 1766;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            this.state = 1769;
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
        this.enterRule(localContext, 190, CypherParser.RULE_oC_ImplicitProcedureInvocation);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1771;
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
        this.enterRule(localContext, 192, CypherParser.RULE_oC_ProcedureResultField);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1773;
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
        this.enterRule(localContext, 194, CypherParser.RULE_oC_ProcedureName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1775;
            this.oC_Namespace();
            this.state = 1776;
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
        this.enterRule(localContext, 196, CypherParser.RULE_oC_Namespace);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1783;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 330, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1778;
                    this.oC_SymbolicName();
                    this.state = 1779;
                    this.match(CypherParser.T__24);
                    }
                    }
                }
                this.state = 1785;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 330, this.context);
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
        this.enterRule(localContext, 198, CypherParser.RULE_oC_Variable);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1786;
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
        this.enterRule(localContext, 200, CypherParser.RULE_oC_Literal);
        try {
            this.state = 1794;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.TRUE:
            case CypherParser.FALSE:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1788;
                this.oC_BooleanLiteral();
                }
                break;
            case CypherParser.NULL:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1789;
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
                this.state = 1790;
                this.oC_NumberLiteral();
                }
                break;
            case CypherParser.StringLiteral:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 1791;
                this.match(CypherParser.StringLiteral);
                }
                break;
            case CypherParser.T__11:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 1792;
                this.oC_ListLiteral();
                }
                break;
            case CypherParser.T__6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 1793;
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
        this.enterRule(localContext, 202, CypherParser.RULE_oC_BooleanLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1796;
            _la = this.tokenStream.LA(1);
            if(!(_la === 100 || _la === 101)) {
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
        this.enterRule(localContext, 204, CypherParser.RULE_oC_NumberLiteral);
        try {
            this.state = 1800;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.ExponentDecimalReal:
            case CypherParser.RegularDecimalReal:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1798;
                this.oC_DoubleLiteral();
                }
                break;
            case CypherParser.HexInteger:
            case CypherParser.DecimalInteger:
            case CypherParser.OctalInteger:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1799;
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
        this.enterRule(localContext, 206, CypherParser.RULE_oC_IntegerLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1802;
            _la = this.tokenStream.LA(1);
            if(!(((((_la - 102)) & ~0x1F) === 0 && ((1 << (_la - 102)) & 7) !== 0))) {
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
        this.enterRule(localContext, 208, CypherParser.RULE_oC_DoubleLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1804;
            _la = this.tokenStream.LA(1);
            if(!(_la === 112 || _la === 113)) {
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
        this.enterRule(localContext, 210, CypherParser.RULE_oC_ListLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1806;
            this.match(CypherParser.T__11);
            this.state = 1808;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1807;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1827;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 70258824) !== 0) || ((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 2147549207) !== 0) || ((((_la - 78)) & ~0x1F) === 0 && ((1 << (_la - 78)) & 268311569) !== 0) || ((((_la - 112)) & ~0x1F) === 0 && ((1 << (_la - 112)) & 647175) !== 0)) {
                {
                this.state = 1810;
                this.oC_Expression();
                this.state = 1812;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1811;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1824;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 4) {
                    {
                    {
                    this.state = 1814;
                    this.match(CypherParser.T__3);
                    this.state = 1816;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 1815;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1818;
                    this.oC_Expression();
                    this.state = 1820;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 1819;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 1826;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            this.state = 1829;
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
        this.enterRule(localContext, 212, CypherParser.RULE_oC_MapLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1831;
            this.match(CypherParser.T__6);
            this.state = 1833;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 132) {
                {
                this.state = 1832;
                this.match(CypherParser.SP);
                }
            }

            this.state = 1868;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 4294574079) !== 0) || ((((_la - 78)) & ~0x1F) === 0 && ((1 << (_la - 78)) & 150994943) !== 0) || ((((_la - 116)) & ~0x1F) === 0 && ((1 << (_la - 116)) & 40959) !== 0)) {
                {
                this.state = 1835;
                this.oC_PropertyKeyName();
                this.state = 1837;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1836;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1839;
                this.match(CypherParser.T__1);
                this.state = 1841;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1840;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1843;
                this.oC_Expression();
                this.state = 1845;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 132) {
                    {
                    this.state = 1844;
                    this.match(CypherParser.SP);
                    }
                }

                this.state = 1865;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 4) {
                    {
                    {
                    this.state = 1847;
                    this.match(CypherParser.T__3);
                    this.state = 1849;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 1848;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1851;
                    this.oC_PropertyKeyName();
                    this.state = 1853;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 1852;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1855;
                    this.match(CypherParser.T__1);
                    this.state = 1857;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 1856;
                        this.match(CypherParser.SP);
                        }
                    }

                    this.state = 1859;
                    this.oC_Expression();
                    this.state = 1861;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 132) {
                        {
                        this.state = 1860;
                        this.match(CypherParser.SP);
                        }
                    }

                    }
                    }
                    this.state = 1867;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            this.state = 1870;
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
        this.enterRule(localContext, 214, CypherParser.RULE_oC_PropertyKeyName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1872;
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
        this.enterRule(localContext, 216, CypherParser.RULE_oC_Parameter);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1874;
            this.match(CypherParser.T__25);
            this.state = 1877;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case CypherParser.INDEX:
            case CypherParser.ASSERT:
            case CypherParser.FULLTEXT:
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
                this.state = 1875;
                this.oC_SymbolicName();
                }
                break;
            case CypherParser.DecimalInteger:
                {
                this.state = 1876;
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
        this.enterRule(localContext, 218, CypherParser.RULE_oC_SchemaName);
        try {
            this.state = 1881;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 350, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1879;
                this.oC_SymbolicName();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1880;
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
        this.enterRule(localContext, 220, CypherParser.RULE_oC_ReservedWord);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1883;
            _la = this.tokenStream.LA(1);
            if(!(((((_la - 49)) & ~0x1F) === 0 && ((1 << (_la - 49)) & 3489611775) !== 0) || ((((_la - 81)) & ~0x1F) === 0 && ((1 << (_la - 81)) & 1851135) !== 0) || ((((_la - 116)) & ~0x1F) === 0 && ((1 << (_la - 116)) & 1023) !== 0))) {
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
        this.enterRule(localContext, 222, CypherParser.RULE_oC_SymbolicName);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1885;
            _la = this.tokenStream.LA(1);
            if(!(((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & 2147549191) !== 0) || ((((_la - 78)) & ~0x1F) === 0 && ((1 << (_la - 78)) & 136185857) !== 0) || ((((_la - 125)) & ~0x1F) === 0 && ((1 << (_la - 125)) & 79) !== 0))) {
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
        this.enterRule(localContext, 224, CypherParser.RULE_oC_LeftArrowHead);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1887;
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
        this.enterRule(localContext, 226, CypherParser.RULE_oC_RightArrowHead);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1889;
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
        this.enterRule(localContext, 228, CypherParser.RULE_oC_Dash);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1891;
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
        4,1,134,1894,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,
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
        1,0,3,0,232,8,0,1,0,1,0,3,0,236,8,0,1,0,3,0,239,8,0,1,0,3,0,242,
        8,0,1,0,1,0,1,1,1,1,1,2,1,2,1,2,3,2,251,8,2,1,3,1,3,1,3,1,3,3,3,
        257,8,3,1,4,1,4,1,4,1,4,3,4,263,8,4,1,4,1,4,3,4,267,8,4,1,4,1,4,
        3,4,271,8,4,1,4,1,4,3,4,275,8,4,1,4,1,4,3,4,279,8,4,1,4,1,4,1,4,
        1,4,3,4,285,8,4,1,4,1,4,3,4,289,8,4,1,4,1,4,3,4,293,8,4,1,4,1,4,
        3,4,297,8,4,1,5,1,5,1,5,1,5,3,5,303,8,5,1,5,1,5,3,5,307,8,5,1,5,
        1,5,3,5,311,8,5,1,5,1,5,3,5,315,8,5,1,5,1,5,3,5,319,8,5,1,5,1,5,
        1,5,1,5,3,5,325,8,5,1,5,1,5,3,5,329,8,5,1,5,1,5,3,5,333,8,5,1,5,
        1,5,3,5,337,8,5,1,6,1,6,3,6,341,8,6,1,7,1,7,3,7,345,8,7,1,7,1,7,
        3,7,349,8,7,1,7,1,7,3,7,353,8,7,1,7,5,7,356,8,7,10,7,12,7,359,9,
        7,1,7,3,7,362,8,7,1,7,1,7,1,8,1,8,1,8,1,8,1,8,1,8,3,8,372,8,8,1,
        8,1,8,1,8,1,8,1,8,1,8,3,8,380,8,8,1,8,1,8,3,8,384,8,8,1,8,5,8,387,
        8,8,10,8,12,8,390,9,8,1,8,1,8,3,8,394,8,8,1,9,1,9,1,9,1,9,1,9,1,
        9,3,9,402,8,9,1,9,1,9,1,9,1,9,1,9,1,9,3,9,410,8,9,1,9,1,9,3,9,414,
        8,9,1,9,5,9,417,8,9,10,9,12,9,420,9,9,1,9,1,9,3,9,424,8,9,1,10,1,
        10,1,10,1,10,1,10,1,10,1,10,1,10,3,10,434,8,10,1,11,1,11,3,11,438,
        8,11,1,11,5,11,441,8,11,10,11,12,11,444,9,11,1,12,1,12,1,12,1,12,
        3,12,450,8,12,1,12,1,12,1,12,3,12,455,8,12,1,12,3,12,458,8,12,1,
        13,1,13,3,13,462,8,13,1,14,1,14,3,14,466,8,14,5,14,468,8,14,10,14,
        12,14,471,9,14,1,14,1,14,1,14,3,14,476,8,14,5,14,478,8,14,10,14,
        12,14,481,9,14,1,14,1,14,3,14,485,8,14,1,14,5,14,488,8,14,10,14,
        12,14,491,9,14,1,14,3,14,494,8,14,1,14,3,14,497,8,14,3,14,499,8,
        14,1,15,1,15,3,15,503,8,15,5,15,505,8,15,10,15,12,15,508,9,15,1,
        15,1,15,3,15,512,8,15,5,15,514,8,15,10,15,12,15,517,9,15,1,15,1,
        15,3,15,521,8,15,4,15,523,8,15,11,15,12,15,524,1,15,1,15,1,16,1,
        16,1,16,1,16,1,16,1,16,1,16,3,16,536,8,16,1,17,1,17,1,17,1,17,3,
        17,542,8,17,1,18,1,18,3,18,546,8,18,1,18,1,18,3,18,550,8,18,1,18,
        1,18,1,18,1,18,1,18,1,18,3,18,558,8,18,1,18,1,18,3,18,562,8,18,1,
        18,4,18,565,8,18,11,18,12,18,566,1,18,3,18,570,8,18,1,18,1,18,1,
        19,1,19,3,19,576,8,19,1,19,1,19,3,19,580,8,19,1,19,1,19,3,19,584,
        8,19,1,19,1,19,1,20,1,20,3,20,590,8,20,1,20,1,20,3,20,594,8,20,1,
        20,1,20,3,20,598,8,20,1,20,3,20,601,8,20,1,21,1,21,3,21,605,8,21,
        1,21,1,21,1,21,1,21,1,21,1,21,1,22,1,22,3,22,615,8,22,1,22,1,22,
        1,22,5,22,620,8,22,10,22,12,22,623,9,22,1,23,1,23,1,23,1,23,1,23,
        1,23,1,23,1,23,1,23,1,23,3,23,635,8,23,1,24,1,24,3,24,639,8,24,1,
        24,1,24,1,25,1,25,3,25,645,8,25,1,25,1,25,3,25,649,8,25,1,25,1,25,
        3,25,653,8,25,1,25,5,25,656,8,25,10,25,12,25,659,9,25,1,26,1,26,
        3,26,663,8,26,1,26,1,26,3,26,667,8,26,1,26,1,26,1,26,1,26,3,26,673,
        8,26,1,26,1,26,3,26,677,8,26,1,26,1,26,1,26,1,26,3,26,683,8,26,1,
        26,1,26,3,26,687,8,26,1,26,1,26,1,26,1,26,3,26,693,8,26,1,26,1,26,
        3,26,697,8,26,1,27,1,27,3,27,701,8,27,1,27,1,27,3,27,705,8,27,1,
        27,1,27,3,27,709,8,27,1,27,1,27,3,27,713,8,27,1,27,5,27,716,8,27,
        10,27,12,27,719,9,27,1,28,1,28,1,28,1,28,3,28,725,8,28,1,28,1,28,
        3,28,729,8,28,1,28,5,28,732,8,28,10,28,12,28,735,9,28,1,29,1,29,
        1,29,1,29,3,29,741,8,29,1,30,1,30,1,30,1,30,3,30,747,8,30,1,30,1,
        30,1,30,3,30,752,8,30,1,31,1,31,1,31,1,31,3,31,758,8,31,1,31,3,31,
        761,8,31,1,31,1,31,1,31,1,31,3,31,767,8,31,3,31,769,8,31,1,32,1,
        32,3,32,773,8,32,1,32,1,32,3,32,777,8,32,1,32,5,32,780,8,32,10,32,
        12,32,783,9,32,1,32,3,32,786,8,32,1,32,3,32,789,8,32,1,33,1,33,1,
        33,1,33,1,33,3,33,796,8,33,1,33,1,33,1,34,1,34,1,34,3,34,803,8,34,
        1,34,3,34,806,8,34,1,35,1,35,1,35,1,36,3,36,812,8,36,1,36,3,36,815,
        8,36,1,36,1,36,1,36,1,36,3,36,821,8,36,1,36,1,36,3,36,825,8,36,1,
        36,1,36,3,36,829,8,36,1,37,1,37,3,37,833,8,37,1,37,1,37,3,37,837,
        8,37,1,37,5,37,840,8,37,10,37,12,37,843,9,37,1,37,1,37,3,37,847,
        8,37,1,37,1,37,3,37,851,8,37,1,37,5,37,854,8,37,10,37,12,37,857,
        9,37,3,37,859,8,37,1,38,1,38,1,38,1,38,1,38,1,38,1,38,3,38,868,8,
        38,1,39,1,39,1,39,1,39,1,39,1,39,1,39,3,39,877,8,39,1,39,5,39,880,
        8,39,10,39,12,39,883,9,39,1,40,1,40,1,40,1,40,1,41,1,41,1,41,1,41,
        1,42,1,42,3,42,895,8,42,1,42,3,42,898,8,42,1,43,1,43,1,43,1,43,1,
        44,1,44,3,44,906,8,44,1,44,1,44,3,44,910,8,44,1,44,5,44,913,8,44,
        10,44,12,44,916,9,44,1,45,1,45,3,45,920,8,45,1,45,1,45,3,45,924,
        8,45,1,45,1,45,1,45,3,45,929,8,45,1,46,1,46,3,46,933,8,46,1,47,1,
        47,3,47,937,8,47,1,47,1,47,3,47,941,8,47,1,47,1,47,3,47,945,8,47,
        1,47,1,47,1,48,1,48,3,48,951,8,48,1,48,5,48,954,8,48,10,48,12,48,
        957,9,48,1,48,1,48,1,48,1,48,3,48,963,8,48,1,49,1,49,3,49,967,8,
        49,1,49,4,49,970,8,49,11,49,12,49,971,1,50,1,50,3,50,976,8,50,1,
        50,1,50,3,50,980,8,50,3,50,982,8,50,1,50,1,50,3,50,986,8,50,3,50,
        988,8,50,1,50,1,50,3,50,992,8,50,3,50,994,8,50,1,50,1,50,1,51,1,
        51,3,51,1000,8,51,1,51,1,51,1,52,1,52,3,52,1006,8,52,1,52,1,52,3,
        52,1010,8,52,1,52,3,52,1013,8,52,1,52,3,52,1016,8,52,1,52,1,52,3,
        52,1020,8,52,1,52,1,52,1,52,1,52,3,52,1026,8,52,1,52,1,52,3,52,1030,
        8,52,1,52,3,52,1033,8,52,1,52,3,52,1036,8,52,1,52,1,52,1,52,1,52,
        3,52,1042,8,52,1,52,3,52,1045,8,52,1,52,3,52,1048,8,52,1,52,1,52,
        3,52,1052,8,52,1,52,1,52,1,52,1,52,3,52,1058,8,52,1,52,3,52,1061,
        8,52,1,52,3,52,1064,8,52,1,52,1,52,3,52,1068,8,52,1,53,1,53,3,53,
        1072,8,53,1,53,1,53,3,53,1076,8,53,3,53,1078,8,53,1,53,1,53,3,53,
        1082,8,53,3,53,1084,8,53,1,53,3,53,1087,8,53,1,53,1,53,3,53,1091,
        8,53,3,53,1093,8,53,1,53,1,53,1,54,1,54,3,54,1099,8,54,1,55,1,55,
        3,55,1103,8,55,1,55,1,55,3,55,1107,8,55,1,55,1,55,3,55,1111,8,55,
        1,55,3,55,1114,8,55,1,55,5,55,1117,8,55,10,55,12,55,1120,9,55,1,
        56,1,56,3,56,1124,8,56,1,56,5,56,1127,8,56,10,56,12,56,1130,9,56,
        1,57,1,57,3,57,1134,8,57,1,57,1,57,1,58,1,58,3,58,1140,8,58,1,58,
        1,58,3,58,1144,8,58,3,58,1146,8,58,1,58,1,58,3,58,1150,8,58,1,58,
        1,58,3,58,1154,8,58,3,58,1156,8,58,3,58,1158,8,58,1,59,1,59,1,60,
        1,60,1,61,1,61,3,61,1166,8,61,1,61,4,61,1169,8,61,11,61,12,61,1170,
        1,62,1,62,1,63,1,63,1,63,1,63,1,63,5,63,1180,8,63,10,63,12,63,1183,
        9,63,1,64,1,64,1,64,1,64,1,64,5,64,1190,8,64,10,64,12,64,1193,9,
        64,1,65,1,65,1,65,1,65,1,65,5,65,1200,8,65,10,65,12,65,1203,9,65,
        1,66,1,66,3,66,1207,8,66,5,66,1209,8,66,10,66,12,66,1212,9,66,1,
        66,1,66,1,67,1,67,3,67,1218,8,67,1,67,5,67,1221,8,67,10,67,12,67,
        1224,9,67,1,68,1,68,3,68,1228,8,68,1,68,1,68,1,68,3,68,1233,8,68,
        1,68,1,68,1,68,3,68,1238,8,68,1,68,1,68,1,68,3,68,1243,8,68,1,68,
        1,68,1,68,3,68,1248,8,68,1,68,1,68,1,68,3,68,1253,8,68,1,68,3,68,
        1256,8,68,1,69,1,69,1,69,1,69,5,69,1262,8,69,10,69,12,69,1265,9,
        69,1,70,1,70,1,70,1,70,1,70,1,70,1,70,1,70,1,70,1,70,3,70,1277,8,
        70,1,70,3,70,1280,8,70,1,70,1,70,1,71,1,71,1,71,3,71,1287,8,71,1,
        71,1,71,1,72,1,72,1,72,1,72,1,72,1,72,1,72,1,72,1,72,1,72,3,72,1301,
        8,72,1,73,1,73,3,73,1305,8,73,1,73,1,73,3,73,1309,8,73,1,73,1,73,
        3,73,1313,8,73,1,73,1,73,3,73,1317,8,73,1,73,5,73,1320,8,73,10,73,
        12,73,1323,9,73,1,74,1,74,3,74,1327,8,74,1,74,1,74,3,74,1331,8,74,
        1,74,1,74,3,74,1335,8,74,1,74,1,74,3,74,1339,8,74,1,74,1,74,3,74,
        1343,8,74,1,74,1,74,3,74,1347,8,74,1,74,5,74,1350,8,74,10,74,12,
        74,1353,9,74,1,75,1,75,3,75,1357,8,75,1,75,1,75,3,75,1361,8,75,1,
        75,5,75,1364,8,75,10,75,12,75,1367,9,75,1,76,1,76,1,76,3,76,1372,
        8,76,1,76,3,76,1375,8,76,1,77,1,77,3,77,1379,8,77,1,77,1,77,3,77,
        1383,8,77,1,77,5,77,1386,8,77,10,77,12,77,1389,9,77,1,77,3,77,1392,
        8,77,1,77,3,77,1395,8,77,1,78,1,78,1,78,1,78,1,78,1,78,3,78,1403,
        8,78,1,78,1,78,3,78,1407,8,78,1,78,3,78,1410,8,78,1,79,1,79,3,79,
        1414,8,79,1,79,1,79,1,80,1,80,1,80,1,80,1,80,3,80,1423,8,80,1,80,
        1,80,3,80,1427,8,80,1,80,1,80,3,80,1431,8,80,1,80,1,80,1,80,1,80,
        1,80,1,80,1,80,1,80,1,80,1,80,1,80,3,80,1444,8,80,1,81,1,81,3,81,
        1448,8,81,1,81,4,81,1451,8,81,11,81,12,81,1452,1,81,1,81,3,81,1457,
        8,81,1,81,1,81,3,81,1461,8,81,1,81,4,81,1464,8,81,11,81,12,81,1465,
        3,81,1468,8,81,1,81,3,81,1471,8,81,1,81,1,81,3,81,1475,8,81,1,81,
        3,81,1478,8,81,1,81,3,81,1481,8,81,1,81,1,81,1,82,1,82,3,82,1487,
        8,82,1,82,1,82,3,82,1491,8,82,1,82,1,82,3,82,1495,8,82,1,82,1,82,
        1,83,1,83,3,83,1501,8,83,1,83,1,83,3,83,1505,8,83,1,83,1,83,3,83,
        1509,8,83,1,83,3,83,1512,8,83,1,83,3,83,1515,8,83,1,83,1,83,1,84,
        1,84,3,84,1521,8,84,1,84,1,84,3,84,1525,8,84,1,84,1,84,3,84,1529,
        8,84,3,84,1531,8,84,1,84,1,84,3,84,1535,8,84,1,84,1,84,3,84,1539,
        8,84,3,84,1541,8,84,1,84,1,84,3,84,1545,8,84,1,84,1,84,3,84,1549,
        8,84,1,84,1,84,1,85,1,85,3,85,1555,8,85,1,85,1,85,3,85,1559,8,85,
        1,85,1,85,3,85,1563,8,85,1,85,1,85,1,85,1,85,3,85,1569,8,85,1,85,
        1,85,3,85,1573,8,85,1,85,1,85,3,85,1577,8,85,1,85,1,85,1,85,1,85,
        3,85,1583,8,85,1,85,1,85,3,85,1587,8,85,1,85,1,85,3,85,1591,8,85,
        1,85,1,85,1,85,1,85,3,85,1597,8,85,1,85,1,85,3,85,1601,8,85,1,85,
        1,85,3,85,1605,8,85,1,85,1,85,3,85,1609,8,85,1,86,1,86,3,86,1613,
        8,86,1,86,3,86,1616,8,86,1,87,1,87,1,88,1,88,3,88,1622,8,88,1,88,
        1,88,3,88,1626,8,88,1,88,1,88,1,89,1,89,1,89,1,89,1,89,1,89,1,90,
        1,90,3,90,1638,8,90,1,90,1,90,3,90,1642,8,90,1,90,1,90,3,90,1646,
        8,90,1,90,1,90,3,90,1650,8,90,1,90,1,90,3,90,1654,8,90,1,90,1,90,
        3,90,1658,8,90,1,90,1,90,3,90,1662,8,90,1,90,1,90,3,90,1666,8,90,
        1,90,1,90,3,90,1670,8,90,1,90,1,90,1,91,1,91,3,91,1676,8,91,1,91,
        1,91,3,91,1680,8,91,1,91,1,91,3,91,1684,8,91,3,91,1686,8,91,1,91,
        1,91,3,91,1690,8,91,1,91,1,91,3,91,1694,8,91,1,91,1,91,3,91,1698,
        8,91,5,91,1700,8,91,10,91,12,91,1703,9,91,3,91,1705,8,91,1,91,1,
        91,1,92,1,92,1,92,1,93,1,93,3,93,1714,8,93,1,93,1,93,3,93,1718,8,
        93,1,93,1,93,1,93,3,93,1723,8,93,4,93,1725,8,93,11,93,12,93,1726,
        1,93,1,93,3,93,1731,8,93,1,93,3,93,1734,8,93,3,93,1736,8,93,1,93,
        3,93,1739,8,93,1,93,1,93,1,94,1,94,3,94,1745,8,94,1,94,1,94,3,94,
        1749,8,94,1,94,1,94,3,94,1753,8,94,1,94,1,94,3,94,1757,8,94,1,94,
        1,94,3,94,1761,8,94,5,94,1763,8,94,10,94,12,94,1766,9,94,3,94,1768,
        8,94,1,94,1,94,1,95,1,95,1,96,1,96,1,97,1,97,1,97,1,98,1,98,1,98,
        5,98,1782,8,98,10,98,12,98,1785,9,98,1,99,1,99,1,100,1,100,1,100,
        1,100,1,100,1,100,3,100,1795,8,100,1,101,1,101,1,102,1,102,3,102,
        1801,8,102,1,103,1,103,1,104,1,104,1,105,1,105,3,105,1809,8,105,
        1,105,1,105,3,105,1813,8,105,1,105,1,105,3,105,1817,8,105,1,105,
        1,105,3,105,1821,8,105,5,105,1823,8,105,10,105,12,105,1826,9,105,
        3,105,1828,8,105,1,105,1,105,1,106,1,106,3,106,1834,8,106,1,106,
        1,106,3,106,1838,8,106,1,106,1,106,3,106,1842,8,106,1,106,1,106,
        3,106,1846,8,106,1,106,1,106,3,106,1850,8,106,1,106,1,106,3,106,
        1854,8,106,1,106,1,106,3,106,1858,8,106,1,106,1,106,3,106,1862,8,
        106,5,106,1864,8,106,10,106,12,106,1867,9,106,3,106,1869,8,106,1,
        106,1,106,1,107,1,107,1,108,1,108,1,108,3,108,1878,8,108,1,109,1,
        109,3,109,1882,8,109,1,110,1,110,1,111,1,111,1,112,1,112,1,113,1,
        113,1,114,1,114,1,114,0,0,115,0,2,4,6,8,10,12,14,16,18,20,22,24,
        26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,60,62,64,66,68,
        70,72,74,76,78,80,82,84,86,88,90,92,94,96,98,100,102,104,106,108,
        110,112,114,116,118,120,122,124,126,128,130,132,134,136,138,140,
        142,144,146,148,150,152,154,156,158,160,162,164,166,168,170,172,
        174,176,178,180,182,184,186,188,190,192,194,196,198,200,202,204,
        206,208,210,212,214,216,218,220,222,224,226,228,0,11,1,0,72,75,1,
        0,77,78,1,0,20,21,1,0,100,101,1,0,102,104,1,0,112,113,6,0,49,62,
        65,76,79,88,90,94,99,101,116,125,8,0,46,48,62,62,77,78,89,89,95,
        98,105,105,125,128,131,131,2,0,16,16,27,30,2,0,17,17,31,34,2,0,21,
        21,35,45,2169,0,231,1,0,0,0,2,245,1,0,0,0,4,250,1,0,0,0,6,256,1,
        0,0,0,8,258,1,0,0,0,10,298,1,0,0,0,12,340,1,0,0,0,14,342,1,0,0,0,
        16,365,1,0,0,0,18,395,1,0,0,0,20,433,1,0,0,0,22,435,1,0,0,0,24,457,
        1,0,0,0,26,461,1,0,0,0,28,498,1,0,0,0,30,522,1,0,0,0,32,535,1,0,
        0,0,34,541,1,0,0,0,36,543,1,0,0,0,38,573,1,0,0,0,40,589,1,0,0,0,
        42,602,1,0,0,0,44,612,1,0,0,0,46,634,1,0,0,0,48,636,1,0,0,0,50,642,
        1,0,0,0,52,696,1,0,0,0,54,700,1,0,0,0,56,720,1,0,0,0,58,740,1,0,
        0,0,60,742,1,0,0,0,62,753,1,0,0,0,64,770,1,0,0,0,66,795,1,0,0,0,
        68,799,1,0,0,0,70,807,1,0,0,0,72,814,1,0,0,0,74,858,1,0,0,0,76,867,
        1,0,0,0,78,869,1,0,0,0,80,884,1,0,0,0,82,888,1,0,0,0,84,892,1,0,
        0,0,86,899,1,0,0,0,88,903,1,0,0,0,90,928,1,0,0,0,92,932,1,0,0,0,
        94,934,1,0,0,0,96,962,1,0,0,0,98,964,1,0,0,0,100,973,1,0,0,0,102,
        997,1,0,0,0,104,1067,1,0,0,0,106,1069,1,0,0,0,108,1098,1,0,0,0,110,
        1100,1,0,0,0,112,1121,1,0,0,0,114,1131,1,0,0,0,116,1137,1,0,0,0,
        118,1159,1,0,0,0,120,1161,1,0,0,0,122,1163,1,0,0,0,124,1172,1,0,
        0,0,126,1174,1,0,0,0,128,1184,1,0,0,0,130,1194,1,0,0,0,132,1210,
        1,0,0,0,134,1215,1,0,0,0,136,1255,1,0,0,0,138,1257,1,0,0,0,140,1276,
        1,0,0,0,142,1283,1,0,0,0,144,1300,1,0,0,0,146,1302,1,0,0,0,148,1324,
        1,0,0,0,150,1354,1,0,0,0,152,1374,1,0,0,0,154,1376,1,0,0,0,156,1409,
        1,0,0,0,158,1411,1,0,0,0,160,1443,1,0,0,0,162,1467,1,0,0,0,164,1484,
        1,0,0,0,166,1498,1,0,0,0,168,1518,1,0,0,0,170,1608,1,0,0,0,172,1610,
        1,0,0,0,174,1617,1,0,0,0,176,1619,1,0,0,0,178,1629,1,0,0,0,180,1635,
        1,0,0,0,182,1673,1,0,0,0,184,1708,1,0,0,0,186,1711,1,0,0,0,188,1742,
        1,0,0,0,190,1771,1,0,0,0,192,1773,1,0,0,0,194,1775,1,0,0,0,196,1783,
        1,0,0,0,198,1786,1,0,0,0,200,1794,1,0,0,0,202,1796,1,0,0,0,204,1800,
        1,0,0,0,206,1802,1,0,0,0,208,1804,1,0,0,0,210,1806,1,0,0,0,212,1831,
        1,0,0,0,214,1872,1,0,0,0,216,1874,1,0,0,0,218,1881,1,0,0,0,220,1883,
        1,0,0,0,222,1885,1,0,0,0,224,1887,1,0,0,0,226,1889,1,0,0,0,228,1891,
        1,0,0,0,230,232,5,132,0,0,231,230,1,0,0,0,231,232,1,0,0,0,232,233,
        1,0,0,0,233,238,3,2,1,0,234,236,5,132,0,0,235,234,1,0,0,0,235,236,
        1,0,0,0,236,237,1,0,0,0,237,239,5,1,0,0,238,235,1,0,0,0,238,239,
        1,0,0,0,239,241,1,0,0,0,240,242,5,132,0,0,241,240,1,0,0,0,241,242,
        1,0,0,0,242,243,1,0,0,0,243,244,5,0,0,1,244,1,1,0,0,0,245,246,3,
        4,2,0,246,3,1,0,0,0,247,251,3,22,11,0,248,251,3,62,31,0,249,251,
        3,6,3,0,250,247,1,0,0,0,250,248,1,0,0,0,250,249,1,0,0,0,251,5,1,
        0,0,0,252,257,3,8,4,0,253,257,3,10,5,0,254,257,3,16,8,0,255,257,
        3,18,9,0,256,252,1,0,0,0,256,253,1,0,0,0,256,254,1,0,0,0,256,255,
        1,0,0,0,257,7,1,0,0,0,258,259,5,58,0,0,259,262,5,132,0,0,260,261,
        5,48,0,0,261,263,5,132,0,0,262,260,1,0,0,0,262,263,1,0,0,0,263,264,
        1,0,0,0,264,266,5,46,0,0,265,267,5,132,0,0,266,265,1,0,0,0,266,267,
        1,0,0,0,267,296,1,0,0,0,268,270,5,118,0,0,269,271,5,132,0,0,270,
        269,1,0,0,0,270,271,1,0,0,0,271,272,1,0,0,0,272,274,3,12,6,0,273,
        275,5,132,0,0,274,273,1,0,0,0,274,275,1,0,0,0,275,276,1,0,0,0,276,
        278,5,57,0,0,277,279,5,132,0,0,278,277,1,0,0,0,278,279,1,0,0,0,279,
        280,1,0,0,0,280,281,3,14,7,0,281,297,1,0,0,0,282,284,5,57,0,0,283,
        285,5,132,0,0,284,283,1,0,0,0,284,285,1,0,0,0,285,286,1,0,0,0,286,
        288,5,2,0,0,287,289,5,132,0,0,288,287,1,0,0,0,288,289,1,0,0,0,289,
        290,1,0,0,0,290,292,3,118,59,0,291,293,5,132,0,0,292,291,1,0,0,0,
        292,293,1,0,0,0,293,294,1,0,0,0,294,295,3,14,7,0,295,297,1,0,0,0,
        296,268,1,0,0,0,296,282,1,0,0,0,297,9,1,0,0,0,298,299,5,125,0,0,
        299,302,5,132,0,0,300,301,5,48,0,0,301,303,5,132,0,0,302,300,1,0,
        0,0,302,303,1,0,0,0,303,304,1,0,0,0,304,306,5,46,0,0,305,307,5,132,
        0,0,306,305,1,0,0,0,306,307,1,0,0,0,307,336,1,0,0,0,308,310,5,118,
        0,0,309,311,5,132,0,0,310,309,1,0,0,0,310,311,1,0,0,0,311,312,1,
        0,0,0,312,314,3,12,6,0,313,315,5,132,0,0,314,313,1,0,0,0,314,315,
        1,0,0,0,315,316,1,0,0,0,316,318,5,57,0,0,317,319,5,132,0,0,318,317,
        1,0,0,0,318,319,1,0,0,0,319,320,1,0,0,0,320,321,3,14,7,0,321,337,
        1,0,0,0,322,324,5,57,0,0,323,325,5,132,0,0,324,323,1,0,0,0,324,325,
        1,0,0,0,325,326,1,0,0,0,326,328,5,2,0,0,327,329,5,132,0,0,328,327,
        1,0,0,0,328,329,1,0,0,0,329,330,1,0,0,0,330,332,3,118,59,0,331,333,
        5,132,0,0,332,331,1,0,0,0,332,333,1,0,0,0,333,334,1,0,0,0,334,335,
        3,14,7,0,335,337,1,0,0,0,336,308,1,0,0,0,336,322,1,0,0,0,337,11,
        1,0,0,0,338,341,3,100,50,0,339,341,3,98,49,0,340,338,1,0,0,0,340,
        339,1,0,0,0,341,13,1,0,0,0,342,344,5,3,0,0,343,345,5,132,0,0,344,
        343,1,0,0,0,344,345,1,0,0,0,345,346,1,0,0,0,346,357,3,124,62,0,347,
        349,5,132,0,0,348,347,1,0,0,0,348,349,1,0,0,0,349,350,1,0,0,0,350,
        352,5,4,0,0,351,353,5,132,0,0,352,351,1,0,0,0,352,353,1,0,0,0,353,
        354,1,0,0,0,354,356,3,124,62,0,355,348,1,0,0,0,356,359,1,0,0,0,357,
        355,1,0,0,0,357,358,1,0,0,0,358,361,1,0,0,0,359,357,1,0,0,0,360,
        362,5,132,0,0,361,360,1,0,0,0,361,362,1,0,0,0,362,363,1,0,0,0,363,
        364,5,5,0,0,364,15,1,0,0,0,365,366,5,58,0,0,366,367,5,132,0,0,367,
        368,5,116,0,0,368,369,5,132,0,0,369,371,5,57,0,0,370,372,5,132,0,
        0,371,370,1,0,0,0,371,372,1,0,0,0,372,373,1,0,0,0,373,374,3,12,6,
        0,374,375,5,132,0,0,375,376,5,47,0,0,376,377,5,132,0,0,377,388,3,
        124,62,0,378,380,5,132,0,0,379,378,1,0,0,0,379,380,1,0,0,0,380,381,
        1,0,0,0,381,383,5,4,0,0,382,384,5,132,0,0,383,382,1,0,0,0,383,384,
        1,0,0,0,384,385,1,0,0,0,385,387,3,124,62,0,386,379,1,0,0,0,387,390,
        1,0,0,0,388,386,1,0,0,0,388,389,1,0,0,0,389,393,1,0,0,0,390,388,
        1,0,0,0,391,392,5,132,0,0,392,394,3,20,10,0,393,391,1,0,0,0,393,
        394,1,0,0,0,394,17,1,0,0,0,395,396,5,125,0,0,396,397,5,132,0,0,397,
        398,5,116,0,0,398,399,5,132,0,0,399,401,5,57,0,0,400,402,5,132,0,
        0,401,400,1,0,0,0,401,402,1,0,0,0,402,403,1,0,0,0,403,404,3,12,6,
        0,404,405,5,132,0,0,405,406,5,47,0,0,406,407,5,132,0,0,407,418,3,
        124,62,0,408,410,5,132,0,0,409,408,1,0,0,0,409,410,1,0,0,0,410,411,
        1,0,0,0,411,413,5,4,0,0,412,414,5,132,0,0,413,412,1,0,0,0,413,414,
        1,0,0,0,414,415,1,0,0,0,415,417,3,124,62,0,416,409,1,0,0,0,417,420,
        1,0,0,0,418,416,1,0,0,0,418,419,1,0,0,0,419,423,1,0,0,0,420,418,
        1,0,0,0,421,422,5,132,0,0,422,424,3,20,10,0,423,421,1,0,0,0,423,
        424,1,0,0,0,424,19,1,0,0,0,425,426,5,87,0,0,426,427,5,132,0,0,427,
        434,5,120,0,0,428,429,5,87,0,0,429,430,5,132,0,0,430,431,5,82,0,
        0,431,432,5,132,0,0,432,434,5,88,0,0,433,425,1,0,0,0,433,428,1,0,
        0,0,434,21,1,0,0,0,435,442,3,26,13,0,436,438,5,132,0,0,437,436,1,
        0,0,0,437,438,1,0,0,0,438,439,1,0,0,0,439,441,3,24,12,0,440,437,
        1,0,0,0,441,444,1,0,0,0,442,440,1,0,0,0,442,443,1,0,0,0,443,23,1,
        0,0,0,444,442,1,0,0,0,445,446,5,49,0,0,446,447,5,132,0,0,447,449,
        5,50,0,0,448,450,5,132,0,0,449,448,1,0,0,0,449,450,1,0,0,0,450,451,
        1,0,0,0,451,458,3,26,13,0,452,454,5,49,0,0,453,455,5,132,0,0,454,
        453,1,0,0,0,454,455,1,0,0,0,455,456,1,0,0,0,456,458,3,26,13,0,457,
        445,1,0,0,0,457,452,1,0,0,0,458,25,1,0,0,0,459,462,3,28,14,0,460,
        462,3,30,15,0,461,459,1,0,0,0,461,460,1,0,0,0,462,27,1,0,0,0,463,
        465,3,34,17,0,464,466,5,132,0,0,465,464,1,0,0,0,465,466,1,0,0,0,
        466,468,1,0,0,0,467,463,1,0,0,0,468,471,1,0,0,0,469,467,1,0,0,0,
        469,470,1,0,0,0,470,472,1,0,0,0,471,469,1,0,0,0,472,499,3,70,35,
        0,473,475,3,34,17,0,474,476,5,132,0,0,475,474,1,0,0,0,475,476,1,
        0,0,0,476,478,1,0,0,0,477,473,1,0,0,0,478,481,1,0,0,0,479,477,1,
        0,0,0,479,480,1,0,0,0,480,482,1,0,0,0,481,479,1,0,0,0,482,489,3,
        32,16,0,483,485,5,132,0,0,484,483,1,0,0,0,484,485,1,0,0,0,485,486,
        1,0,0,0,486,488,3,32,16,0,487,484,1,0,0,0,488,491,1,0,0,0,489,487,
        1,0,0,0,489,490,1,0,0,0,490,496,1,0,0,0,491,489,1,0,0,0,492,494,
        5,132,0,0,493,492,1,0,0,0,493,494,1,0,0,0,494,495,1,0,0,0,495,497,
        3,70,35,0,496,493,1,0,0,0,496,497,1,0,0,0,497,499,1,0,0,0,498,469,
        1,0,0,0,498,479,1,0,0,0,499,29,1,0,0,0,500,502,3,34,17,0,501,503,
        5,132,0,0,502,501,1,0,0,0,502,503,1,0,0,0,503,505,1,0,0,0,504,500,
        1,0,0,0,505,508,1,0,0,0,506,504,1,0,0,0,506,507,1,0,0,0,507,515,
        1,0,0,0,508,506,1,0,0,0,509,511,3,32,16,0,510,512,5,132,0,0,511,
        510,1,0,0,0,511,512,1,0,0,0,512,514,1,0,0,0,513,509,1,0,0,0,514,
        517,1,0,0,0,515,513,1,0,0,0,515,516,1,0,0,0,516,518,1,0,0,0,517,
        515,1,0,0,0,518,520,3,68,34,0,519,521,5,132,0,0,520,519,1,0,0,0,
        520,521,1,0,0,0,521,523,1,0,0,0,522,506,1,0,0,0,523,524,1,0,0,0,
        524,522,1,0,0,0,524,525,1,0,0,0,525,526,1,0,0,0,526,527,3,28,14,
        0,527,31,1,0,0,0,528,536,3,48,24,0,529,536,3,44,22,0,530,536,3,54,
        27,0,531,536,3,50,25,0,532,536,3,56,28,0,533,536,3,36,18,0,534,536,
        3,38,19,0,535,528,1,0,0,0,535,529,1,0,0,0,535,530,1,0,0,0,535,531,
        1,0,0,0,535,532,1,0,0,0,535,533,1,0,0,0,535,534,1,0,0,0,536,33,1,
        0,0,0,537,542,3,40,20,0,538,542,3,42,21,0,539,542,3,60,30,0,540,
        542,3,38,19,0,541,537,1,0,0,0,541,538,1,0,0,0,541,539,1,0,0,0,541,
        540,1,0,0,0,542,35,1,0,0,0,543,545,5,51,0,0,544,546,5,132,0,0,545,
        544,1,0,0,0,545,546,1,0,0,0,546,547,1,0,0,0,547,549,5,3,0,0,548,
        550,5,132,0,0,549,548,1,0,0,0,549,550,1,0,0,0,550,551,1,0,0,0,551,
        552,3,198,99,0,552,553,5,132,0,0,553,554,5,86,0,0,554,555,5,132,
        0,0,555,557,3,124,62,0,556,558,5,132,0,0,557,556,1,0,0,0,557,558,
        1,0,0,0,558,559,1,0,0,0,559,564,5,6,0,0,560,562,5,132,0,0,561,560,
        1,0,0,0,561,562,1,0,0,0,562,563,1,0,0,0,563,565,3,32,16,0,564,561,
        1,0,0,0,565,566,1,0,0,0,566,564,1,0,0,0,566,567,1,0,0,0,567,569,
        1,0,0,0,568,570,5,132,0,0,569,568,1,0,0,0,569,570,1,0,0,0,570,571,
        1,0,0,0,571,572,5,5,0,0,572,37,1,0,0,0,573,575,5,63,0,0,574,576,
        5,132,0,0,575,574,1,0,0,0,575,576,1,0,0,0,576,577,1,0,0,0,577,579,
        5,7,0,0,578,580,5,132,0,0,579,578,1,0,0,0,579,580,1,0,0,0,580,581,
        1,0,0,0,581,583,3,22,11,0,582,584,5,132,0,0,583,582,1,0,0,0,583,
        584,1,0,0,0,584,585,1,0,0,0,585,586,5,8,0,0,586,39,1,0,0,0,587,588,
        5,52,0,0,588,590,5,132,0,0,589,587,1,0,0,0,589,590,1,0,0,0,590,591,
        1,0,0,0,591,593,5,53,0,0,592,594,5,132,0,0,593,592,1,0,0,0,593,594,
        1,0,0,0,594,595,1,0,0,0,595,600,3,88,44,0,596,598,5,132,0,0,597,
        596,1,0,0,0,597,598,1,0,0,0,598,599,1,0,0,0,599,601,3,86,43,0,600,
        597,1,0,0,0,600,601,1,0,0,0,601,41,1,0,0,0,602,604,5,54,0,0,603,
        605,5,132,0,0,604,603,1,0,0,0,604,605,1,0,0,0,605,606,1,0,0,0,606,
        607,3,124,62,0,607,608,5,132,0,0,608,609,5,55,0,0,609,610,5,132,
        0,0,610,611,3,198,99,0,611,43,1,0,0,0,612,614,5,56,0,0,613,615,5,
        132,0,0,614,613,1,0,0,0,614,615,1,0,0,0,615,616,1,0,0,0,616,621,
        3,90,45,0,617,618,5,132,0,0,618,620,3,46,23,0,619,617,1,0,0,0,620,
        623,1,0,0,0,621,619,1,0,0,0,621,622,1,0,0,0,622,45,1,0,0,0,623,621,
        1,0,0,0,624,625,5,57,0,0,625,626,5,132,0,0,626,627,5,53,0,0,627,
        628,5,132,0,0,628,635,3,50,25,0,629,630,5,57,0,0,630,631,5,132,0,
        0,631,632,5,58,0,0,632,633,5,132,0,0,633,635,3,50,25,0,634,624,1,
        0,0,0,634,629,1,0,0,0,635,47,1,0,0,0,636,638,5,58,0,0,637,639,5,
        132,0,0,638,637,1,0,0,0,638,639,1,0,0,0,639,640,1,0,0,0,640,641,
        3,88,44,0,641,49,1,0,0,0,642,644,5,59,0,0,643,645,5,132,0,0,644,
        643,1,0,0,0,644,645,1,0,0,0,645,646,1,0,0,0,646,657,3,52,26,0,647,
        649,5,132,0,0,648,647,1,0,0,0,648,649,1,0,0,0,649,650,1,0,0,0,650,
        652,5,4,0,0,651,653,5,132,0,0,652,651,1,0,0,0,652,653,1,0,0,0,653,
        654,1,0,0,0,654,656,3,52,26,0,655,648,1,0,0,0,656,659,1,0,0,0,657,
        655,1,0,0,0,657,658,1,0,0,0,658,51,1,0,0,0,659,657,1,0,0,0,660,662,
        3,122,61,0,661,663,5,132,0,0,662,661,1,0,0,0,662,663,1,0,0,0,663,
        664,1,0,0,0,664,666,5,9,0,0,665,667,5,132,0,0,666,665,1,0,0,0,666,
        667,1,0,0,0,667,668,1,0,0,0,668,669,3,124,62,0,669,697,1,0,0,0,670,
        672,3,198,99,0,671,673,5,132,0,0,672,671,1,0,0,0,672,673,1,0,0,0,
        673,674,1,0,0,0,674,676,5,9,0,0,675,677,5,132,0,0,676,675,1,0,0,
        0,676,677,1,0,0,0,677,678,1,0,0,0,678,679,3,124,62,0,679,697,1,0,
        0,0,680,682,3,198,99,0,681,683,5,132,0,0,682,681,1,0,0,0,682,683,
        1,0,0,0,683,684,1,0,0,0,684,686,5,10,0,0,685,687,5,132,0,0,686,685,
        1,0,0,0,686,687,1,0,0,0,687,688,1,0,0,0,688,689,3,124,62,0,689,697,
        1,0,0,0,690,692,3,198,99,0,691,693,5,132,0,0,692,691,1,0,0,0,692,
        693,1,0,0,0,693,694,1,0,0,0,694,695,3,112,56,0,695,697,1,0,0,0,696,
        660,1,0,0,0,696,670,1,0,0,0,696,680,1,0,0,0,696,690,1,0,0,0,697,
        53,1,0,0,0,698,699,5,60,0,0,699,701,5,132,0,0,700,698,1,0,0,0,700,
        701,1,0,0,0,701,702,1,0,0,0,702,704,5,61,0,0,703,705,5,132,0,0,704,
        703,1,0,0,0,704,705,1,0,0,0,705,706,1,0,0,0,706,717,3,124,62,0,707,
        709,5,132,0,0,708,707,1,0,0,0,708,709,1,0,0,0,709,710,1,0,0,0,710,
        712,5,4,0,0,711,713,5,132,0,0,712,711,1,0,0,0,712,713,1,0,0,0,713,
        714,1,0,0,0,714,716,3,124,62,0,715,708,1,0,0,0,716,719,1,0,0,0,717,
        715,1,0,0,0,717,718,1,0,0,0,718,55,1,0,0,0,719,717,1,0,0,0,720,721,
        5,62,0,0,721,722,5,132,0,0,722,733,3,58,29,0,723,725,5,132,0,0,724,
        723,1,0,0,0,724,725,1,0,0,0,725,726,1,0,0,0,726,728,5,4,0,0,727,
        729,5,132,0,0,728,727,1,0,0,0,728,729,1,0,0,0,729,730,1,0,0,0,730,
        732,3,58,29,0,731,724,1,0,0,0,732,735,1,0,0,0,733,731,1,0,0,0,733,
        734,1,0,0,0,734,57,1,0,0,0,735,733,1,0,0,0,736,737,3,198,99,0,737,
        738,3,112,56,0,738,741,1,0,0,0,739,741,3,122,61,0,740,736,1,0,0,
        0,740,739,1,0,0,0,741,59,1,0,0,0,742,743,5,63,0,0,743,744,5,132,
        0,0,744,751,3,188,94,0,745,747,5,132,0,0,746,745,1,0,0,0,746,747,
        1,0,0,0,747,748,1,0,0,0,748,749,5,64,0,0,749,750,5,132,0,0,750,752,
        3,64,32,0,751,746,1,0,0,0,751,752,1,0,0,0,752,61,1,0,0,0,753,754,
        5,63,0,0,754,757,5,132,0,0,755,758,3,188,94,0,756,758,3,190,95,0,
        757,755,1,0,0,0,757,756,1,0,0,0,758,768,1,0,0,0,759,761,5,132,0,
        0,760,759,1,0,0,0,760,761,1,0,0,0,761,762,1,0,0,0,762,763,5,64,0,
        0,763,766,5,132,0,0,764,767,5,11,0,0,765,767,3,64,32,0,766,764,1,
        0,0,0,766,765,1,0,0,0,767,769,1,0,0,0,768,760,1,0,0,0,768,769,1,
        0,0,0,769,63,1,0,0,0,770,781,3,66,33,0,771,773,5,132,0,0,772,771,
        1,0,0,0,772,773,1,0,0,0,773,774,1,0,0,0,774,776,5,4,0,0,775,777,
        5,132,0,0,776,775,1,0,0,0,776,777,1,0,0,0,777,778,1,0,0,0,778,780,
        3,66,33,0,779,772,1,0,0,0,780,783,1,0,0,0,781,779,1,0,0,0,781,782,
        1,0,0,0,782,788,1,0,0,0,783,781,1,0,0,0,784,786,5,132,0,0,785,784,
        1,0,0,0,785,786,1,0,0,0,786,787,1,0,0,0,787,789,3,86,43,0,788,785,
        1,0,0,0,788,789,1,0,0,0,789,65,1,0,0,0,790,791,3,192,96,0,791,792,
        5,132,0,0,792,793,5,55,0,0,793,794,5,132,0,0,794,796,1,0,0,0,795,
        790,1,0,0,0,795,796,1,0,0,0,796,797,1,0,0,0,797,798,3,198,99,0,798,
        67,1,0,0,0,799,800,5,65,0,0,800,805,3,72,36,0,801,803,5,132,0,0,
        802,801,1,0,0,0,802,803,1,0,0,0,803,804,1,0,0,0,804,806,3,86,43,
        0,805,802,1,0,0,0,805,806,1,0,0,0,806,69,1,0,0,0,807,808,5,66,0,
        0,808,809,3,72,36,0,809,71,1,0,0,0,810,812,5,132,0,0,811,810,1,0,
        0,0,811,812,1,0,0,0,812,813,1,0,0,0,813,815,5,67,0,0,814,811,1,0,
        0,0,814,815,1,0,0,0,815,816,1,0,0,0,816,817,5,132,0,0,817,820,3,
        74,37,0,818,819,5,132,0,0,819,821,3,78,39,0,820,818,1,0,0,0,820,
        821,1,0,0,0,821,824,1,0,0,0,822,823,5,132,0,0,823,825,3,80,40,0,
        824,822,1,0,0,0,824,825,1,0,0,0,825,828,1,0,0,0,826,827,5,132,0,
        0,827,829,3,82,41,0,828,826,1,0,0,0,828,829,1,0,0,0,829,73,1,0,0,
        0,830,841,5,11,0,0,831,833,5,132,0,0,832,831,1,0,0,0,832,833,1,0,
        0,0,833,834,1,0,0,0,834,836,5,4,0,0,835,837,5,132,0,0,836,835,1,
        0,0,0,836,837,1,0,0,0,837,838,1,0,0,0,838,840,3,76,38,0,839,832,
        1,0,0,0,840,843,1,0,0,0,841,839,1,0,0,0,841,842,1,0,0,0,842,859,
        1,0,0,0,843,841,1,0,0,0,844,855,3,76,38,0,845,847,5,132,0,0,846,
        845,1,0,0,0,846,847,1,0,0,0,847,848,1,0,0,0,848,850,5,4,0,0,849,
        851,5,132,0,0,850,849,1,0,0,0,850,851,1,0,0,0,851,852,1,0,0,0,852,
        854,3,76,38,0,853,846,1,0,0,0,854,857,1,0,0,0,855,853,1,0,0,0,855,
        856,1,0,0,0,856,859,1,0,0,0,857,855,1,0,0,0,858,830,1,0,0,0,858,
        844,1,0,0,0,859,75,1,0,0,0,860,861,3,124,62,0,861,862,5,132,0,0,
        862,863,5,55,0,0,863,864,5,132,0,0,864,865,3,198,99,0,865,868,1,
        0,0,0,866,868,3,124,62,0,867,860,1,0,0,0,867,866,1,0,0,0,868,77,
        1,0,0,0,869,870,5,68,0,0,870,871,5,132,0,0,871,872,5,69,0,0,872,
        873,5,132,0,0,873,881,3,84,42,0,874,876,5,4,0,0,875,877,5,132,0,
        0,876,875,1,0,0,0,876,877,1,0,0,0,877,878,1,0,0,0,878,880,3,84,42,
        0,879,874,1,0,0,0,880,883,1,0,0,0,881,879,1,0,0,0,881,882,1,0,0,
        0,882,79,1,0,0,0,883,881,1,0,0,0,884,885,5,70,0,0,885,886,5,132,
        0,0,886,887,3,124,62,0,887,81,1,0,0,0,888,889,5,71,0,0,889,890,5,
        132,0,0,890,891,3,124,62,0,891,83,1,0,0,0,892,897,3,124,62,0,893,
        895,5,132,0,0,894,893,1,0,0,0,894,895,1,0,0,0,895,896,1,0,0,0,896,
        898,7,0,0,0,897,894,1,0,0,0,897,898,1,0,0,0,898,85,1,0,0,0,899,900,
        5,76,0,0,900,901,5,132,0,0,901,902,3,124,62,0,902,87,1,0,0,0,903,
        914,3,90,45,0,904,906,5,132,0,0,905,904,1,0,0,0,905,906,1,0,0,0,
        906,907,1,0,0,0,907,909,5,4,0,0,908,910,5,132,0,0,909,908,1,0,0,
        0,909,910,1,0,0,0,910,911,1,0,0,0,911,913,3,90,45,0,912,905,1,0,
        0,0,913,916,1,0,0,0,914,912,1,0,0,0,914,915,1,0,0,0,915,89,1,0,0,
        0,916,914,1,0,0,0,917,919,3,198,99,0,918,920,5,132,0,0,919,918,1,
        0,0,0,919,920,1,0,0,0,920,921,1,0,0,0,921,923,5,9,0,0,922,924,5,
        132,0,0,923,922,1,0,0,0,923,924,1,0,0,0,924,925,1,0,0,0,925,926,
        3,92,46,0,926,929,1,0,0,0,927,929,3,92,46,0,928,917,1,0,0,0,928,
        927,1,0,0,0,929,91,1,0,0,0,930,933,3,94,47,0,931,933,3,96,48,0,932,
        930,1,0,0,0,932,931,1,0,0,0,933,93,1,0,0,0,934,936,7,1,0,0,935,937,
        5,132,0,0,936,935,1,0,0,0,936,937,1,0,0,0,937,938,1,0,0,0,938,940,
        5,3,0,0,939,941,5,132,0,0,940,939,1,0,0,0,940,941,1,0,0,0,941,942,
        1,0,0,0,942,944,3,96,48,0,943,945,5,132,0,0,944,943,1,0,0,0,944,
        945,1,0,0,0,945,946,1,0,0,0,946,947,5,5,0,0,947,95,1,0,0,0,948,955,
        3,100,50,0,949,951,5,132,0,0,950,949,1,0,0,0,950,951,1,0,0,0,951,
        952,1,0,0,0,952,954,3,102,51,0,953,950,1,0,0,0,954,957,1,0,0,0,955,
        953,1,0,0,0,955,956,1,0,0,0,956,963,1,0,0,0,957,955,1,0,0,0,958,
        959,5,3,0,0,959,960,3,96,48,0,960,961,5,5,0,0,961,963,1,0,0,0,962,
        948,1,0,0,0,962,958,1,0,0,0,963,97,1,0,0,0,964,969,3,100,50,0,965,
        967,5,132,0,0,966,965,1,0,0,0,966,967,1,0,0,0,967,968,1,0,0,0,968,
        970,3,102,51,0,969,966,1,0,0,0,970,971,1,0,0,0,971,969,1,0,0,0,971,
        972,1,0,0,0,972,99,1,0,0,0,973,975,5,3,0,0,974,976,5,132,0,0,975,
        974,1,0,0,0,975,976,1,0,0,0,976,981,1,0,0,0,977,979,3,198,99,0,978,
        980,5,132,0,0,979,978,1,0,0,0,979,980,1,0,0,0,980,982,1,0,0,0,981,
        977,1,0,0,0,981,982,1,0,0,0,982,987,1,0,0,0,983,985,3,112,56,0,984,
        986,5,132,0,0,985,984,1,0,0,0,985,986,1,0,0,0,986,988,1,0,0,0,987,
        983,1,0,0,0,987,988,1,0,0,0,988,993,1,0,0,0,989,991,3,108,54,0,990,
        992,5,132,0,0,991,990,1,0,0,0,991,992,1,0,0,0,992,994,1,0,0,0,993,
        989,1,0,0,0,993,994,1,0,0,0,994,995,1,0,0,0,995,996,5,5,0,0,996,
        101,1,0,0,0,997,999,3,104,52,0,998,1000,5,132,0,0,999,998,1,0,0,
        0,999,1000,1,0,0,0,1000,1001,1,0,0,0,1001,1002,3,100,50,0,1002,103,
        1,0,0,0,1003,1005,3,224,112,0,1004,1006,5,132,0,0,1005,1004,1,0,
        0,0,1005,1006,1,0,0,0,1006,1007,1,0,0,0,1007,1009,3,228,114,0,1008,
        1010,5,132,0,0,1009,1008,1,0,0,0,1009,1010,1,0,0,0,1010,1012,1,0,
        0,0,1011,1013,3,106,53,0,1012,1011,1,0,0,0,1012,1013,1,0,0,0,1013,
        1015,1,0,0,0,1014,1016,5,132,0,0,1015,1014,1,0,0,0,1015,1016,1,0,
        0,0,1016,1017,1,0,0,0,1017,1019,3,228,114,0,1018,1020,5,132,0,0,
        1019,1018,1,0,0,0,1019,1020,1,0,0,0,1020,1021,1,0,0,0,1021,1022,
        3,226,113,0,1022,1068,1,0,0,0,1023,1025,3,224,112,0,1024,1026,5,
        132,0,0,1025,1024,1,0,0,0,1025,1026,1,0,0,0,1026,1027,1,0,0,0,1027,
        1029,3,228,114,0,1028,1030,5,132,0,0,1029,1028,1,0,0,0,1029,1030,
        1,0,0,0,1030,1032,1,0,0,0,1031,1033,3,106,53,0,1032,1031,1,0,0,0,
        1032,1033,1,0,0,0,1033,1035,1,0,0,0,1034,1036,5,132,0,0,1035,1034,
        1,0,0,0,1035,1036,1,0,0,0,1036,1037,1,0,0,0,1037,1038,3,228,114,
        0,1038,1068,1,0,0,0,1039,1041,3,228,114,0,1040,1042,5,132,0,0,1041,
        1040,1,0,0,0,1041,1042,1,0,0,0,1042,1044,1,0,0,0,1043,1045,3,106,
        53,0,1044,1043,1,0,0,0,1044,1045,1,0,0,0,1045,1047,1,0,0,0,1046,
        1048,5,132,0,0,1047,1046,1,0,0,0,1047,1048,1,0,0,0,1048,1049,1,0,
        0,0,1049,1051,3,228,114,0,1050,1052,5,132,0,0,1051,1050,1,0,0,0,
        1051,1052,1,0,0,0,1052,1053,1,0,0,0,1053,1054,3,226,113,0,1054,1068,
        1,0,0,0,1055,1057,3,228,114,0,1056,1058,5,132,0,0,1057,1056,1,0,
        0,0,1057,1058,1,0,0,0,1058,1060,1,0,0,0,1059,1061,3,106,53,0,1060,
        1059,1,0,0,0,1060,1061,1,0,0,0,1061,1063,1,0,0,0,1062,1064,5,132,
        0,0,1063,1062,1,0,0,0,1063,1064,1,0,0,0,1064,1065,1,0,0,0,1065,1066,
        3,228,114,0,1066,1068,1,0,0,0,1067,1003,1,0,0,0,1067,1023,1,0,0,
        0,1067,1039,1,0,0,0,1067,1055,1,0,0,0,1068,105,1,0,0,0,1069,1071,
        5,12,0,0,1070,1072,5,132,0,0,1071,1070,1,0,0,0,1071,1072,1,0,0,0,
        1072,1077,1,0,0,0,1073,1075,3,198,99,0,1074,1076,5,132,0,0,1075,
        1074,1,0,0,0,1075,1076,1,0,0,0,1076,1078,1,0,0,0,1077,1073,1,0,0,
        0,1077,1078,1,0,0,0,1078,1083,1,0,0,0,1079,1081,3,110,55,0,1080,
        1082,5,132,0,0,1081,1080,1,0,0,0,1081,1082,1,0,0,0,1082,1084,1,0,
        0,0,1083,1079,1,0,0,0,1083,1084,1,0,0,0,1084,1086,1,0,0,0,1085,1087,
        3,116,58,0,1086,1085,1,0,0,0,1086,1087,1,0,0,0,1087,1092,1,0,0,0,
        1088,1090,3,108,54,0,1089,1091,5,132,0,0,1090,1089,1,0,0,0,1090,
        1091,1,0,0,0,1091,1093,1,0,0,0,1092,1088,1,0,0,0,1092,1093,1,0,0,
        0,1093,1094,1,0,0,0,1094,1095,5,13,0,0,1095,107,1,0,0,0,1096,1099,
        3,212,106,0,1097,1099,3,216,108,0,1098,1096,1,0,0,0,1098,1097,1,
        0,0,0,1099,109,1,0,0,0,1100,1102,5,2,0,0,1101,1103,5,132,0,0,1102,
        1101,1,0,0,0,1102,1103,1,0,0,0,1103,1104,1,0,0,0,1104,1118,3,120,
        60,0,1105,1107,5,132,0,0,1106,1105,1,0,0,0,1106,1107,1,0,0,0,1107,
        1108,1,0,0,0,1108,1110,5,6,0,0,1109,1111,5,2,0,0,1110,1109,1,0,0,
        0,1110,1111,1,0,0,0,1111,1113,1,0,0,0,1112,1114,5,132,0,0,1113,1112,
        1,0,0,0,1113,1114,1,0,0,0,1114,1115,1,0,0,0,1115,1117,3,120,60,0,
        1116,1106,1,0,0,0,1117,1120,1,0,0,0,1118,1116,1,0,0,0,1118,1119,
        1,0,0,0,1119,111,1,0,0,0,1120,1118,1,0,0,0,1121,1128,3,114,57,0,
        1122,1124,5,132,0,0,1123,1122,1,0,0,0,1123,1124,1,0,0,0,1124,1125,
        1,0,0,0,1125,1127,3,114,57,0,1126,1123,1,0,0,0,1127,1130,1,0,0,0,
        1128,1126,1,0,0,0,1128,1129,1,0,0,0,1129,113,1,0,0,0,1130,1128,1,
        0,0,0,1131,1133,5,2,0,0,1132,1134,5,132,0,0,1133,1132,1,0,0,0,1133,
        1134,1,0,0,0,1134,1135,1,0,0,0,1135,1136,3,118,59,0,1136,115,1,0,
        0,0,1137,1139,5,11,0,0,1138,1140,5,132,0,0,1139,1138,1,0,0,0,1139,
        1140,1,0,0,0,1140,1145,1,0,0,0,1141,1143,3,206,103,0,1142,1144,5,
        132,0,0,1143,1142,1,0,0,0,1143,1144,1,0,0,0,1144,1146,1,0,0,0,1145,
        1141,1,0,0,0,1145,1146,1,0,0,0,1146,1157,1,0,0,0,1147,1149,5,14,
        0,0,1148,1150,5,132,0,0,1149,1148,1,0,0,0,1149,1150,1,0,0,0,1150,
        1155,1,0,0,0,1151,1153,3,206,103,0,1152,1154,5,132,0,0,1153,1152,
        1,0,0,0,1153,1154,1,0,0,0,1154,1156,1,0,0,0,1155,1151,1,0,0,0,1155,
        1156,1,0,0,0,1156,1158,1,0,0,0,1157,1147,1,0,0,0,1157,1158,1,0,0,
        0,1158,117,1,0,0,0,1159,1160,3,218,109,0,1160,119,1,0,0,0,1161,1162,
        3,218,109,0,1162,121,1,0,0,0,1163,1168,3,160,80,0,1164,1166,5,132,
        0,0,1165,1164,1,0,0,0,1165,1166,1,0,0,0,1166,1167,1,0,0,0,1167,1169,
        3,158,79,0,1168,1165,1,0,0,0,1169,1170,1,0,0,0,1170,1168,1,0,0,0,
        1170,1171,1,0,0,0,1171,123,1,0,0,0,1172,1173,3,126,63,0,1173,125,
        1,0,0,0,1174,1181,3,128,64,0,1175,1176,5,132,0,0,1176,1177,5,79,
        0,0,1177,1178,5,132,0,0,1178,1180,3,128,64,0,1179,1175,1,0,0,0,1180,
        1183,1,0,0,0,1181,1179,1,0,0,0,1181,1182,1,0,0,0,1182,127,1,0,0,
        0,1183,1181,1,0,0,0,1184,1191,3,130,65,0,1185,1186,5,132,0,0,1186,
        1187,5,80,0,0,1187,1188,5,132,0,0,1188,1190,3,130,65,0,1189,1185,
        1,0,0,0,1190,1193,1,0,0,0,1191,1189,1,0,0,0,1191,1192,1,0,0,0,1192,
        129,1,0,0,0,1193,1191,1,0,0,0,1194,1201,3,132,66,0,1195,1196,5,132,
        0,0,1196,1197,5,81,0,0,1197,1198,5,132,0,0,1198,1200,3,132,66,0,
        1199,1195,1,0,0,0,1200,1203,1,0,0,0,1201,1199,1,0,0,0,1201,1202,
        1,0,0,0,1202,131,1,0,0,0,1203,1201,1,0,0,0,1204,1206,5,82,0,0,1205,
        1207,5,132,0,0,1206,1205,1,0,0,0,1206,1207,1,0,0,0,1207,1209,1,0,
        0,0,1208,1204,1,0,0,0,1209,1212,1,0,0,0,1210,1208,1,0,0,0,1210,1211,
        1,0,0,0,1211,1213,1,0,0,0,1212,1210,1,0,0,0,1213,1214,3,134,67,0,
        1214,133,1,0,0,0,1215,1222,3,138,69,0,1216,1218,5,132,0,0,1217,1216,
        1,0,0,0,1217,1218,1,0,0,0,1218,1219,1,0,0,0,1219,1221,3,136,68,0,
        1220,1217,1,0,0,0,1221,1224,1,0,0,0,1222,1220,1,0,0,0,1222,1223,
        1,0,0,0,1223,135,1,0,0,0,1224,1222,1,0,0,0,1225,1227,5,9,0,0,1226,
        1228,5,132,0,0,1227,1226,1,0,0,0,1227,1228,1,0,0,0,1228,1229,1,0,
        0,0,1229,1256,3,138,69,0,1230,1232,5,15,0,0,1231,1233,5,132,0,0,
        1232,1231,1,0,0,0,1232,1233,1,0,0,0,1233,1234,1,0,0,0,1234,1256,
        3,138,69,0,1235,1237,5,16,0,0,1236,1238,5,132,0,0,1237,1236,1,0,
        0,0,1237,1238,1,0,0,0,1238,1239,1,0,0,0,1239,1256,3,138,69,0,1240,
        1242,5,17,0,0,1241,1243,5,132,0,0,1242,1241,1,0,0,0,1242,1243,1,
        0,0,0,1243,1244,1,0,0,0,1244,1256,3,138,69,0,1245,1247,5,18,0,0,
        1246,1248,5,132,0,0,1247,1246,1,0,0,0,1247,1248,1,0,0,0,1248,1249,
        1,0,0,0,1249,1256,3,138,69,0,1250,1252,5,19,0,0,1251,1253,5,132,
        0,0,1252,1251,1,0,0,0,1252,1253,1,0,0,0,1253,1254,1,0,0,0,1254,1256,
        3,138,69,0,1255,1225,1,0,0,0,1255,1230,1,0,0,0,1255,1235,1,0,0,0,
        1255,1240,1,0,0,0,1255,1245,1,0,0,0,1255,1250,1,0,0,0,1256,137,1,
        0,0,0,1257,1263,3,146,73,0,1258,1262,3,140,70,0,1259,1262,3,142,
        71,0,1260,1262,3,144,72,0,1261,1258,1,0,0,0,1261,1259,1,0,0,0,1261,
        1260,1,0,0,0,1262,1265,1,0,0,0,1263,1261,1,0,0,0,1263,1264,1,0,0,
        0,1264,139,1,0,0,0,1265,1263,1,0,0,0,1266,1267,5,132,0,0,1267,1268,
        5,83,0,0,1268,1269,5,132,0,0,1269,1277,5,65,0,0,1270,1271,5,132,
        0,0,1271,1272,5,84,0,0,1272,1273,5,132,0,0,1273,1277,5,65,0,0,1274,
        1275,5,132,0,0,1275,1277,5,85,0,0,1276,1266,1,0,0,0,1276,1270,1,
        0,0,0,1276,1274,1,0,0,0,1277,1279,1,0,0,0,1278,1280,5,132,0,0,1279,
        1278,1,0,0,0,1279,1280,1,0,0,0,1280,1281,1,0,0,0,1281,1282,3,146,
        73,0,1282,141,1,0,0,0,1283,1284,5,132,0,0,1284,1286,5,86,0,0,1285,
        1287,5,132,0,0,1286,1285,1,0,0,0,1286,1287,1,0,0,0,1287,1288,1,0,
        0,0,1288,1289,3,146,73,0,1289,143,1,0,0,0,1290,1291,5,132,0,0,1291,
        1292,5,87,0,0,1292,1293,5,132,0,0,1293,1301,5,88,0,0,1294,1295,5,
        132,0,0,1295,1296,5,87,0,0,1296,1297,5,132,0,0,1297,1298,5,82,0,
        0,1298,1299,5,132,0,0,1299,1301,5,88,0,0,1300,1290,1,0,0,0,1300,
        1294,1,0,0,0,1301,145,1,0,0,0,1302,1321,3,148,74,0,1303,1305,5,132,
        0,0,1304,1303,1,0,0,0,1304,1305,1,0,0,0,1305,1306,1,0,0,0,1306,1308,
        5,20,0,0,1307,1309,5,132,0,0,1308,1307,1,0,0,0,1308,1309,1,0,0,0,
        1309,1310,1,0,0,0,1310,1320,3,148,74,0,1311,1313,5,132,0,0,1312,
        1311,1,0,0,0,1312,1313,1,0,0,0,1313,1314,1,0,0,0,1314,1316,5,21,
        0,0,1315,1317,5,132,0,0,1316,1315,1,0,0,0,1316,1317,1,0,0,0,1317,
        1318,1,0,0,0,1318,1320,3,148,74,0,1319,1304,1,0,0,0,1319,1312,1,
        0,0,0,1320,1323,1,0,0,0,1321,1319,1,0,0,0,1321,1322,1,0,0,0,1322,
        147,1,0,0,0,1323,1321,1,0,0,0,1324,1351,3,150,75,0,1325,1327,5,132,
        0,0,1326,1325,1,0,0,0,1326,1327,1,0,0,0,1327,1328,1,0,0,0,1328,1330,
        5,11,0,0,1329,1331,5,132,0,0,1330,1329,1,0,0,0,1330,1331,1,0,0,0,
        1331,1332,1,0,0,0,1332,1350,3,150,75,0,1333,1335,5,132,0,0,1334,
        1333,1,0,0,0,1334,1335,1,0,0,0,1335,1336,1,0,0,0,1336,1338,5,22,
        0,0,1337,1339,5,132,0,0,1338,1337,1,0,0,0,1338,1339,1,0,0,0,1339,
        1340,1,0,0,0,1340,1350,3,150,75,0,1341,1343,5,132,0,0,1342,1341,
        1,0,0,0,1342,1343,1,0,0,0,1343,1344,1,0,0,0,1344,1346,5,23,0,0,1345,
        1347,5,132,0,0,1346,1345,1,0,0,0,1346,1347,1,0,0,0,1347,1348,1,0,
        0,0,1348,1350,3,150,75,0,1349,1326,1,0,0,0,1349,1334,1,0,0,0,1349,
        1342,1,0,0,0,1350,1353,1,0,0,0,1351,1349,1,0,0,0,1351,1352,1,0,0,
        0,1352,149,1,0,0,0,1353,1351,1,0,0,0,1354,1365,3,152,76,0,1355,1357,
        5,132,0,0,1356,1355,1,0,0,0,1356,1357,1,0,0,0,1357,1358,1,0,0,0,
        1358,1360,5,24,0,0,1359,1361,5,132,0,0,1360,1359,1,0,0,0,1360,1361,
        1,0,0,0,1361,1362,1,0,0,0,1362,1364,3,152,76,0,1363,1356,1,0,0,0,
        1364,1367,1,0,0,0,1365,1363,1,0,0,0,1365,1366,1,0,0,0,1366,151,1,
        0,0,0,1367,1365,1,0,0,0,1368,1375,3,154,77,0,1369,1371,7,2,0,0,1370,
        1372,5,132,0,0,1371,1370,1,0,0,0,1371,1372,1,0,0,0,1372,1373,1,0,
        0,0,1373,1375,3,154,77,0,1374,1368,1,0,0,0,1374,1369,1,0,0,0,1375,
        153,1,0,0,0,1376,1387,3,160,80,0,1377,1379,5,132,0,0,1378,1377,1,
        0,0,0,1378,1379,1,0,0,0,1379,1380,1,0,0,0,1380,1386,3,156,78,0,1381,
        1383,5,132,0,0,1382,1381,1,0,0,0,1382,1383,1,0,0,0,1383,1384,1,0,
        0,0,1384,1386,3,158,79,0,1385,1378,1,0,0,0,1385,1382,1,0,0,0,1386,
        1389,1,0,0,0,1387,1385,1,0,0,0,1387,1388,1,0,0,0,1388,1394,1,0,0,
        0,1389,1387,1,0,0,0,1390,1392,5,132,0,0,1391,1390,1,0,0,0,1391,1392,
        1,0,0,0,1392,1393,1,0,0,0,1393,1395,3,112,56,0,1394,1391,1,0,0,0,
        1394,1395,1,0,0,0,1395,155,1,0,0,0,1396,1397,5,12,0,0,1397,1398,
        3,124,62,0,1398,1399,5,13,0,0,1399,1410,1,0,0,0,1400,1402,5,12,0,
        0,1401,1403,3,124,62,0,1402,1401,1,0,0,0,1402,1403,1,0,0,0,1403,
        1404,1,0,0,0,1404,1406,5,14,0,0,1405,1407,3,124,62,0,1406,1405,1,
        0,0,0,1406,1407,1,0,0,0,1407,1408,1,0,0,0,1408,1410,5,13,0,0,1409,
        1396,1,0,0,0,1409,1400,1,0,0,0,1410,157,1,0,0,0,1411,1413,5,25,0,
        0,1412,1414,5,132,0,0,1413,1412,1,0,0,0,1413,1414,1,0,0,0,1414,1415,
        1,0,0,0,1415,1416,3,214,107,0,1416,159,1,0,0,0,1417,1444,3,200,100,
        0,1418,1444,3,216,108,0,1419,1444,3,162,81,0,1420,1422,5,89,0,0,
        1421,1423,5,132,0,0,1422,1421,1,0,0,0,1422,1423,1,0,0,0,1423,1424,
        1,0,0,0,1424,1426,5,3,0,0,1425,1427,5,132,0,0,1426,1425,1,0,0,0,
        1426,1427,1,0,0,0,1427,1428,1,0,0,0,1428,1430,5,11,0,0,1429,1431,
        5,132,0,0,1430,1429,1,0,0,0,1430,1431,1,0,0,0,1431,1432,1,0,0,0,
        1432,1444,5,5,0,0,1433,1444,3,166,83,0,1434,1444,3,168,84,0,1435,
        1444,3,180,90,0,1436,1444,3,94,47,0,1437,1444,3,170,85,0,1438,1444,
        3,174,87,0,1439,1444,3,176,88,0,1440,1444,3,182,91,0,1441,1444,3,
        186,93,0,1442,1444,3,198,99,0,1443,1417,1,0,0,0,1443,1418,1,0,0,
        0,1443,1419,1,0,0,0,1443,1420,1,0,0,0,1443,1433,1,0,0,0,1443,1434,
        1,0,0,0,1443,1435,1,0,0,0,1443,1436,1,0,0,0,1443,1437,1,0,0,0,1443,
        1438,1,0,0,0,1443,1439,1,0,0,0,1443,1440,1,0,0,0,1443,1441,1,0,0,
        0,1443,1442,1,0,0,0,1444,161,1,0,0,0,1445,1450,5,90,0,0,1446,1448,
        5,132,0,0,1447,1446,1,0,0,0,1447,1448,1,0,0,0,1448,1449,1,0,0,0,
        1449,1451,3,164,82,0,1450,1447,1,0,0,0,1451,1452,1,0,0,0,1452,1450,
        1,0,0,0,1452,1453,1,0,0,0,1453,1468,1,0,0,0,1454,1456,5,90,0,0,1455,
        1457,5,132,0,0,1456,1455,1,0,0,0,1456,1457,1,0,0,0,1457,1458,1,0,
        0,0,1458,1463,3,124,62,0,1459,1461,5,132,0,0,1460,1459,1,0,0,0,1460,
        1461,1,0,0,0,1461,1462,1,0,0,0,1462,1464,3,164,82,0,1463,1460,1,
        0,0,0,1464,1465,1,0,0,0,1465,1463,1,0,0,0,1465,1466,1,0,0,0,1466,
        1468,1,0,0,0,1467,1445,1,0,0,0,1467,1454,1,0,0,0,1468,1477,1,0,0,
        0,1469,1471,5,132,0,0,1470,1469,1,0,0,0,1470,1471,1,0,0,0,1471,1472,
        1,0,0,0,1472,1474,5,91,0,0,1473,1475,5,132,0,0,1474,1473,1,0,0,0,
        1474,1475,1,0,0,0,1475,1476,1,0,0,0,1476,1478,3,124,62,0,1477,1470,
        1,0,0,0,1477,1478,1,0,0,0,1478,1480,1,0,0,0,1479,1481,5,132,0,0,
        1480,1479,1,0,0,0,1480,1481,1,0,0,0,1481,1482,1,0,0,0,1482,1483,
        5,92,0,0,1483,163,1,0,0,0,1484,1486,5,93,0,0,1485,1487,5,132,0,0,
        1486,1485,1,0,0,0,1486,1487,1,0,0,0,1487,1488,1,0,0,0,1488,1490,
        3,124,62,0,1489,1491,5,132,0,0,1490,1489,1,0,0,0,1490,1491,1,0,0,
        0,1491,1492,1,0,0,0,1492,1494,5,94,0,0,1493,1495,5,132,0,0,1494,
        1493,1,0,0,0,1494,1495,1,0,0,0,1495,1496,1,0,0,0,1496,1497,3,124,
        62,0,1497,165,1,0,0,0,1498,1500,5,12,0,0,1499,1501,5,132,0,0,1500,
        1499,1,0,0,0,1500,1501,1,0,0,0,1501,1502,1,0,0,0,1502,1511,3,172,
        86,0,1503,1505,5,132,0,0,1504,1503,1,0,0,0,1504,1505,1,0,0,0,1505,
        1506,1,0,0,0,1506,1508,5,6,0,0,1507,1509,5,132,0,0,1508,1507,1,0,
        0,0,1508,1509,1,0,0,0,1509,1510,1,0,0,0,1510,1512,3,124,62,0,1511,
        1504,1,0,0,0,1511,1512,1,0,0,0,1512,1514,1,0,0,0,1513,1515,5,132,
        0,0,1514,1513,1,0,0,0,1514,1515,1,0,0,0,1515,1516,1,0,0,0,1516,1517,
        5,13,0,0,1517,167,1,0,0,0,1518,1520,5,12,0,0,1519,1521,5,132,0,0,
        1520,1519,1,0,0,0,1520,1521,1,0,0,0,1521,1530,1,0,0,0,1522,1524,
        3,198,99,0,1523,1525,5,132,0,0,1524,1523,1,0,0,0,1524,1525,1,0,0,
        0,1525,1526,1,0,0,0,1526,1528,5,9,0,0,1527,1529,5,132,0,0,1528,1527,
        1,0,0,0,1528,1529,1,0,0,0,1529,1531,1,0,0,0,1530,1522,1,0,0,0,1530,
        1531,1,0,0,0,1531,1532,1,0,0,0,1532,1534,3,98,49,0,1533,1535,5,132,
        0,0,1534,1533,1,0,0,0,1534,1535,1,0,0,0,1535,1540,1,0,0,0,1536,1538,
        3,86,43,0,1537,1539,5,132,0,0,1538,1537,1,0,0,0,1538,1539,1,0,0,
        0,1539,1541,1,0,0,0,1540,1536,1,0,0,0,1540,1541,1,0,0,0,1541,1542,
        1,0,0,0,1542,1544,5,6,0,0,1543,1545,5,132,0,0,1544,1543,1,0,0,0,
        1544,1545,1,0,0,0,1545,1546,1,0,0,0,1546,1548,3,124,62,0,1547,1549,
        5,132,0,0,1548,1547,1,0,0,0,1548,1549,1,0,0,0,1549,1550,1,0,0,0,
        1550,1551,5,13,0,0,1551,169,1,0,0,0,1552,1554,5,50,0,0,1553,1555,
        5,132,0,0,1554,1553,1,0,0,0,1554,1555,1,0,0,0,1555,1556,1,0,0,0,
        1556,1558,5,3,0,0,1557,1559,5,132,0,0,1558,1557,1,0,0,0,1558,1559,
        1,0,0,0,1559,1560,1,0,0,0,1560,1562,3,172,86,0,1561,1563,5,132,0,
        0,1562,1561,1,0,0,0,1562,1563,1,0,0,0,1563,1564,1,0,0,0,1564,1565,
        5,5,0,0,1565,1609,1,0,0,0,1566,1568,5,95,0,0,1567,1569,5,132,0,0,
        1568,1567,1,0,0,0,1568,1569,1,0,0,0,1569,1570,1,0,0,0,1570,1572,
        5,3,0,0,1571,1573,5,132,0,0,1572,1571,1,0,0,0,1572,1573,1,0,0,0,
        1573,1574,1,0,0,0,1574,1576,3,172,86,0,1575,1577,5,132,0,0,1576,
        1575,1,0,0,0,1576,1577,1,0,0,0,1577,1578,1,0,0,0,1578,1579,5,5,0,
        0,1579,1609,1,0,0,0,1580,1582,5,96,0,0,1581,1583,5,132,0,0,1582,
        1581,1,0,0,0,1582,1583,1,0,0,0,1583,1584,1,0,0,0,1584,1586,5,3,0,
        0,1585,1587,5,132,0,0,1586,1585,1,0,0,0,1586,1587,1,0,0,0,1587,1588,
        1,0,0,0,1588,1590,3,172,86,0,1589,1591,5,132,0,0,1590,1589,1,0,0,
        0,1590,1591,1,0,0,0,1591,1592,1,0,0,0,1592,1593,5,5,0,0,1593,1609,
        1,0,0,0,1594,1596,5,97,0,0,1595,1597,5,132,0,0,1596,1595,1,0,0,0,
        1596,1597,1,0,0,0,1597,1598,1,0,0,0,1598,1600,5,3,0,0,1599,1601,
        5,132,0,0,1600,1599,1,0,0,0,1600,1601,1,0,0,0,1601,1602,1,0,0,0,
        1602,1604,3,172,86,0,1603,1605,5,132,0,0,1604,1603,1,0,0,0,1604,
        1605,1,0,0,0,1605,1606,1,0,0,0,1606,1607,5,5,0,0,1607,1609,1,0,0,
        0,1608,1552,1,0,0,0,1608,1566,1,0,0,0,1608,1580,1,0,0,0,1608,1594,
        1,0,0,0,1609,171,1,0,0,0,1610,1615,3,178,89,0,1611,1613,5,132,0,
        0,1612,1611,1,0,0,0,1612,1613,1,0,0,0,1613,1614,1,0,0,0,1614,1616,
        3,86,43,0,1615,1612,1,0,0,0,1615,1616,1,0,0,0,1616,173,1,0,0,0,1617,
        1618,3,98,49,0,1618,175,1,0,0,0,1619,1621,5,3,0,0,1620,1622,5,132,
        0,0,1621,1620,1,0,0,0,1621,1622,1,0,0,0,1622,1623,1,0,0,0,1623,1625,
        3,124,62,0,1624,1626,5,132,0,0,1625,1624,1,0,0,0,1625,1626,1,0,0,
        0,1626,1627,1,0,0,0,1627,1628,5,5,0,0,1628,177,1,0,0,0,1629,1630,
        3,198,99,0,1630,1631,5,132,0,0,1631,1632,5,86,0,0,1632,1633,5,132,
        0,0,1633,1634,3,124,62,0,1634,179,1,0,0,0,1635,1637,5,98,0,0,1636,
        1638,5,132,0,0,1637,1636,1,0,0,0,1637,1638,1,0,0,0,1638,1639,1,0,
        0,0,1639,1641,5,3,0,0,1640,1642,5,132,0,0,1641,1640,1,0,0,0,1641,
        1642,1,0,0,0,1642,1643,1,0,0,0,1643,1645,3,198,99,0,1644,1646,5,
        132,0,0,1645,1644,1,0,0,0,1645,1646,1,0,0,0,1646,1647,1,0,0,0,1647,
        1649,5,9,0,0,1648,1650,5,132,0,0,1649,1648,1,0,0,0,1649,1650,1,0,
        0,0,1650,1651,1,0,0,0,1651,1653,3,124,62,0,1652,1654,5,132,0,0,1653,
        1652,1,0,0,0,1653,1654,1,0,0,0,1654,1655,1,0,0,0,1655,1657,5,4,0,
        0,1656,1658,5,132,0,0,1657,1656,1,0,0,0,1657,1658,1,0,0,0,1658,1659,
        1,0,0,0,1659,1661,3,178,89,0,1660,1662,5,132,0,0,1661,1660,1,0,0,
        0,1661,1662,1,0,0,0,1662,1663,1,0,0,0,1663,1665,5,6,0,0,1664,1666,
        5,132,0,0,1665,1664,1,0,0,0,1665,1666,1,0,0,0,1666,1667,1,0,0,0,
        1667,1669,3,124,62,0,1668,1670,5,132,0,0,1669,1668,1,0,0,0,1669,
        1670,1,0,0,0,1670,1671,1,0,0,0,1671,1672,5,5,0,0,1672,181,1,0,0,
        0,1673,1675,3,184,92,0,1674,1676,5,132,0,0,1675,1674,1,0,0,0,1675,
        1676,1,0,0,0,1676,1677,1,0,0,0,1677,1679,5,3,0,0,1678,1680,5,132,
        0,0,1679,1678,1,0,0,0,1679,1680,1,0,0,0,1680,1685,1,0,0,0,1681,1683,
        5,67,0,0,1682,1684,5,132,0,0,1683,1682,1,0,0,0,1683,1684,1,0,0,0,
        1684,1686,1,0,0,0,1685,1681,1,0,0,0,1685,1686,1,0,0,0,1686,1704,
        1,0,0,0,1687,1689,3,124,62,0,1688,1690,5,132,0,0,1689,1688,1,0,0,
        0,1689,1690,1,0,0,0,1690,1701,1,0,0,0,1691,1693,5,4,0,0,1692,1694,
        5,132,0,0,1693,1692,1,0,0,0,1693,1694,1,0,0,0,1694,1695,1,0,0,0,
        1695,1697,3,124,62,0,1696,1698,5,132,0,0,1697,1696,1,0,0,0,1697,
        1698,1,0,0,0,1698,1700,1,0,0,0,1699,1691,1,0,0,0,1700,1703,1,0,0,
        0,1701,1699,1,0,0,0,1701,1702,1,0,0,0,1702,1705,1,0,0,0,1703,1701,
        1,0,0,0,1704,1687,1,0,0,0,1704,1705,1,0,0,0,1705,1706,1,0,0,0,1706,
        1707,5,5,0,0,1707,183,1,0,0,0,1708,1709,3,196,98,0,1709,1710,3,222,
        111,0,1710,185,1,0,0,0,1711,1713,5,99,0,0,1712,1714,5,132,0,0,1713,
        1712,1,0,0,0,1713,1714,1,0,0,0,1714,1715,1,0,0,0,1715,1717,5,7,0,
        0,1716,1718,5,132,0,0,1717,1716,1,0,0,0,1717,1718,1,0,0,0,1718,1735,
        1,0,0,0,1719,1736,3,22,11,0,1720,1722,3,34,17,0,1721,1723,5,132,
        0,0,1722,1721,1,0,0,0,1722,1723,1,0,0,0,1723,1725,1,0,0,0,1724,1720,
        1,0,0,0,1725,1726,1,0,0,0,1726,1724,1,0,0,0,1726,1727,1,0,0,0,1727,
        1736,1,0,0,0,1728,1733,3,88,44,0,1729,1731,5,132,0,0,1730,1729,1,
        0,0,0,1730,1731,1,0,0,0,1731,1732,1,0,0,0,1732,1734,3,86,43,0,1733,
        1730,1,0,0,0,1733,1734,1,0,0,0,1734,1736,1,0,0,0,1735,1719,1,0,0,
        0,1735,1724,1,0,0,0,1735,1728,1,0,0,0,1736,1738,1,0,0,0,1737,1739,
        5,132,0,0,1738,1737,1,0,0,0,1738,1739,1,0,0,0,1739,1740,1,0,0,0,
        1740,1741,5,8,0,0,1741,187,1,0,0,0,1742,1744,3,194,97,0,1743,1745,
        5,132,0,0,1744,1743,1,0,0,0,1744,1745,1,0,0,0,1745,1746,1,0,0,0,
        1746,1748,5,3,0,0,1747,1749,5,132,0,0,1748,1747,1,0,0,0,1748,1749,
        1,0,0,0,1749,1767,1,0,0,0,1750,1752,3,124,62,0,1751,1753,5,132,0,
        0,1752,1751,1,0,0,0,1752,1753,1,0,0,0,1753,1764,1,0,0,0,1754,1756,
        5,4,0,0,1755,1757,5,132,0,0,1756,1755,1,0,0,0,1756,1757,1,0,0,0,
        1757,1758,1,0,0,0,1758,1760,3,124,62,0,1759,1761,5,132,0,0,1760,
        1759,1,0,0,0,1760,1761,1,0,0,0,1761,1763,1,0,0,0,1762,1754,1,0,0,
        0,1763,1766,1,0,0,0,1764,1762,1,0,0,0,1764,1765,1,0,0,0,1765,1768,
        1,0,0,0,1766,1764,1,0,0,0,1767,1750,1,0,0,0,1767,1768,1,0,0,0,1768,
        1769,1,0,0,0,1769,1770,5,5,0,0,1770,189,1,0,0,0,1771,1772,3,194,
        97,0,1772,191,1,0,0,0,1773,1774,3,222,111,0,1774,193,1,0,0,0,1775,
        1776,3,196,98,0,1776,1777,3,222,111,0,1777,195,1,0,0,0,1778,1779,
        3,222,111,0,1779,1780,5,25,0,0,1780,1782,1,0,0,0,1781,1778,1,0,0,
        0,1782,1785,1,0,0,0,1783,1781,1,0,0,0,1783,1784,1,0,0,0,1784,197,
        1,0,0,0,1785,1783,1,0,0,0,1786,1787,3,222,111,0,1787,199,1,0,0,0,
        1788,1795,3,202,101,0,1789,1795,5,88,0,0,1790,1795,3,204,102,0,1791,
        1795,5,114,0,0,1792,1795,3,210,105,0,1793,1795,3,212,106,0,1794,
        1788,1,0,0,0,1794,1789,1,0,0,0,1794,1790,1,0,0,0,1794,1791,1,0,0,
        0,1794,1792,1,0,0,0,1794,1793,1,0,0,0,1795,201,1,0,0,0,1796,1797,
        7,3,0,0,1797,203,1,0,0,0,1798,1801,3,208,104,0,1799,1801,3,206,103,
        0,1800,1798,1,0,0,0,1800,1799,1,0,0,0,1801,205,1,0,0,0,1802,1803,
        7,4,0,0,1803,207,1,0,0,0,1804,1805,7,5,0,0,1805,209,1,0,0,0,1806,
        1808,5,12,0,0,1807,1809,5,132,0,0,1808,1807,1,0,0,0,1808,1809,1,
        0,0,0,1809,1827,1,0,0,0,1810,1812,3,124,62,0,1811,1813,5,132,0,0,
        1812,1811,1,0,0,0,1812,1813,1,0,0,0,1813,1824,1,0,0,0,1814,1816,
        5,4,0,0,1815,1817,5,132,0,0,1816,1815,1,0,0,0,1816,1817,1,0,0,0,
        1817,1818,1,0,0,0,1818,1820,3,124,62,0,1819,1821,5,132,0,0,1820,
        1819,1,0,0,0,1820,1821,1,0,0,0,1821,1823,1,0,0,0,1822,1814,1,0,0,
        0,1823,1826,1,0,0,0,1824,1822,1,0,0,0,1824,1825,1,0,0,0,1825,1828,
        1,0,0,0,1826,1824,1,0,0,0,1827,1810,1,0,0,0,1827,1828,1,0,0,0,1828,
        1829,1,0,0,0,1829,1830,5,13,0,0,1830,211,1,0,0,0,1831,1833,5,7,0,
        0,1832,1834,5,132,0,0,1833,1832,1,0,0,0,1833,1834,1,0,0,0,1834,1868,
        1,0,0,0,1835,1837,3,214,107,0,1836,1838,5,132,0,0,1837,1836,1,0,
        0,0,1837,1838,1,0,0,0,1838,1839,1,0,0,0,1839,1841,5,2,0,0,1840,1842,
        5,132,0,0,1841,1840,1,0,0,0,1841,1842,1,0,0,0,1842,1843,1,0,0,0,
        1843,1845,3,124,62,0,1844,1846,5,132,0,0,1845,1844,1,0,0,0,1845,
        1846,1,0,0,0,1846,1865,1,0,0,0,1847,1849,5,4,0,0,1848,1850,5,132,
        0,0,1849,1848,1,0,0,0,1849,1850,1,0,0,0,1850,1851,1,0,0,0,1851,1853,
        3,214,107,0,1852,1854,5,132,0,0,1853,1852,1,0,0,0,1853,1854,1,0,
        0,0,1854,1855,1,0,0,0,1855,1857,5,2,0,0,1856,1858,5,132,0,0,1857,
        1856,1,0,0,0,1857,1858,1,0,0,0,1858,1859,1,0,0,0,1859,1861,3,124,
        62,0,1860,1862,5,132,0,0,1861,1860,1,0,0,0,1861,1862,1,0,0,0,1862,
        1864,1,0,0,0,1863,1847,1,0,0,0,1864,1867,1,0,0,0,1865,1863,1,0,0,
        0,1865,1866,1,0,0,0,1866,1869,1,0,0,0,1867,1865,1,0,0,0,1868,1835,
        1,0,0,0,1868,1869,1,0,0,0,1869,1870,1,0,0,0,1870,1871,5,8,0,0,1871,
        213,1,0,0,0,1872,1873,3,218,109,0,1873,215,1,0,0,0,1874,1877,5,26,
        0,0,1875,1878,3,222,111,0,1876,1878,5,103,0,0,1877,1875,1,0,0,0,
        1877,1876,1,0,0,0,1878,217,1,0,0,0,1879,1882,3,222,111,0,1880,1882,
        3,220,110,0,1881,1879,1,0,0,0,1881,1880,1,0,0,0,1882,219,1,0,0,0,
        1883,1884,7,6,0,0,1884,221,1,0,0,0,1885,1886,7,7,0,0,1886,223,1,
        0,0,0,1887,1888,7,8,0,0,1888,225,1,0,0,0,1889,1890,7,9,0,0,1890,
        227,1,0,0,0,1891,1892,7,10,0,0,1892,229,1,0,0,0,351,231,235,238,
        241,250,256,262,266,270,274,278,284,288,292,296,302,306,310,314,
        318,324,328,332,336,340,344,348,352,357,361,371,379,383,388,393,
        401,409,413,418,423,433,437,442,449,454,457,461,465,469,475,479,
        484,489,493,496,498,502,506,511,515,520,524,535,541,545,549,557,
        561,566,569,575,579,583,589,593,597,600,604,614,621,634,638,644,
        648,652,657,662,666,672,676,682,686,692,696,700,704,708,712,717,
        724,728,733,740,746,751,757,760,766,768,772,776,781,785,788,795,
        802,805,811,814,820,824,828,832,836,841,846,850,855,858,867,876,
        881,894,897,905,909,914,919,923,928,932,936,940,944,950,955,962,
        966,971,975,979,981,985,987,991,993,999,1005,1009,1012,1015,1019,
        1025,1029,1032,1035,1041,1044,1047,1051,1057,1060,1063,1067,1071,
        1075,1077,1081,1083,1086,1090,1092,1098,1102,1106,1110,1113,1118,
        1123,1128,1133,1139,1143,1145,1149,1153,1155,1157,1165,1170,1181,
        1191,1201,1206,1210,1217,1222,1227,1232,1237,1242,1247,1252,1255,
        1261,1263,1276,1279,1286,1300,1304,1308,1312,1316,1319,1321,1326,
        1330,1334,1338,1342,1346,1349,1351,1356,1360,1365,1371,1374,1378,
        1382,1385,1387,1391,1394,1402,1406,1409,1413,1422,1426,1430,1443,
        1447,1452,1456,1460,1465,1467,1470,1474,1477,1480,1486,1490,1494,
        1500,1504,1508,1511,1514,1520,1524,1528,1530,1534,1538,1540,1544,
        1548,1554,1558,1562,1568,1572,1576,1582,1586,1590,1596,1600,1604,
        1608,1612,1615,1621,1625,1637,1641,1645,1649,1653,1657,1661,1665,
        1669,1675,1679,1683,1685,1689,1693,1697,1701,1704,1713,1717,1722,
        1726,1730,1733,1735,1738,1744,1748,1752,1756,1760,1764,1767,1783,
        1794,1800,1808,1812,1816,1820,1824,1827,1833,1837,1841,1845,1849,
        1853,1857,1861,1865,1868,1877,1881
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
    public FULLTEXT(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.FULLTEXT, 0);
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
    public FULLTEXT(): antlr.TerminalNode | null {
        return this.getToken(CypherParser.FULLTEXT, 0);
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
