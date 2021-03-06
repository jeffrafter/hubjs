// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================

function Program(str){
 var tbl=[],pos=0,l=str.length+1;while(l--)tbl.push([]);l=str.length;
 function Program(a){var x,p=pos,c;if(x=tbl[p][0]){pos=x[1];a.push([p,0]);return 1}if(x==false){return 0}c=[];return fin(c,p,0,_Program(c),a)}
 function FunctionBody(a){var x,p=pos,c;if(x=tbl[p][1]){pos=x[1];a.push([p,1]);return 1}if(x==false){return 0}c=[];return fin(c,p,1,_FunctionBody(c),a)}
 function FunctionDeclaration(a){var x,p=pos,c;if(x=tbl[p][2]){pos=x[1];a.push([p,2]);return 1}if(x==false){return 0}c=[];return fin(c,p,2,_FunctionDeclaration(c),a)}
 function FunctionExpr(a){var x,p=pos,c;if(x=tbl[p][3]){pos=x[1];a.push([p,3]);return 1}if(x==false){return 0}c=[];return fin(c,p,3,_FunctionExpr(c),a)}
 function FormalParameterList(a){var x,p=pos,c;if(x=tbl[p][4]){pos=x[1];a.push([p,4]);return 1}if(x==false){return 0}c=[];return fin(c,p,4,_FormalParameterList(c),a)}
 function UseStrictDirective(a){var x,p=pos,c;if(x=tbl[p][5]){pos=x[1];a.push([p,5]);return 1}if(x==false){return 0}c=[];return fin(c,p,5,_UseStrictDirective(c),a)}
 function Statement(a){var x,p=pos,c;if(x=tbl[p][6]){pos=x[1];a.push([p,6]);return 1}if(x==false){return 0}c=[];return fin(c,p,6,_Statement(c),a)}
 function Block(a){var x,p=pos,c;if(x=tbl[p][7]){pos=x[1];a.push([p,7]);return 1}if(x==false){return 0}c=[];return fin(c,p,7,_Block(c),a)}
 function VariableStatement(a){var x,p=pos,c;if(x=tbl[p][8]){pos=x[1];a.push([p,8]);return 1}if(x==false){return 0}c=[];return fin(c,p,8,_VariableStatement(c),a)}
 function VariableDeclarationListNoIn(a){var x,p=pos,c;if(x=tbl[p][9]){pos=x[1];a.push([p,9]);return 1}if(x==false){return 0}c=[];return fin(c,p,9,_VariableDeclarationListNoIn(c),a)}
 function VariableDeclaration(a){var x,p=pos,c;if(x=tbl[p][10]){pos=x[1];a.push([p,10]);return 1}if(x==false){return 0}c=[];return fin(c,p,10,_VariableDeclaration(c),a)}
 function VariableDeclarationNoIn(a){var x,p=pos,c;if(x=tbl[p][11]){pos=x[1];a.push([p,11]);return 1}if(x==false){return 0}c=[];return fin(c,p,11,_VariableDeclarationNoIn(c),a)}
 function EmptyStatement(a){var x,p=pos,c;if(x=tbl[p][12]){pos=x[1];a.push([p,12]);return 1}if(x==false){return 0}c=[];return fin(c,p,12,_EmptyStatement(c),a)}
 function ExprStatement(a){var x,p=pos,c;if(x=tbl[p][13]){pos=x[1];a.push([p,13]);return 1}if(x==false){return 0}c=[];return fin(c,p,13,_ExprStatement(c),a)}
 function IfStatement(a){var x,p=pos,c;if(x=tbl[p][14]){pos=x[1];a.push([p,14]);return 1}if(x==false){return 0}c=[];return fin(c,p,14,_IfStatement(c),a)}
 function IterationStatement(a){var x,p=pos,c;if(x=tbl[p][15]){pos=x[1];a.push([p,15]);return 1}if(x==false){return 0}c=[];return fin(c,p,15,_IterationStatement(c),a)}
 function DoWhileStatement(a){var x,p=pos,c;if(x=tbl[p][16]){pos=x[1];a.push([p,16]);return 1}if(x==false){return 0}c=[];return fin(c,p,16,_DoWhileStatement(c),a)}
 function WhileStatement(a){var x,p=pos,c;if(x=tbl[p][17]){pos=x[1];a.push([p,17]);return 1}if(x==false){return 0}c=[];return fin(c,p,17,_WhileStatement(c),a)}
 function ForInStatement(a){var x,p=pos,c;if(x=tbl[p][18]){pos=x[1];a.push([p,18]);return 1}if(x==false){return 0}c=[];return fin(c,p,18,_ForInStatement(c),a)}
 function ForStatement(a){var x,p=pos,c;if(x=tbl[p][19]){pos=x[1];a.push([p,19]);return 1}if(x==false){return 0}c=[];return fin(c,p,19,_ForStatement(c),a)}
 function ContinueStatement(a){var x,p=pos,c;if(x=tbl[p][20]){pos=x[1];a.push([p,20]);return 1}if(x==false){return 0}c=[];return fin(c,p,20,_ContinueStatement(c),a)}
 function BreakStatement(a){var x,p=pos,c;if(x=tbl[p][21]){pos=x[1];a.push([p,21]);return 1}if(x==false){return 0}c=[];return fin(c,p,21,_BreakStatement(c),a)}
 function ReturnStatement(a){var x,p=pos,c;if(x=tbl[p][22]){pos=x[1];a.push([p,22]);return 1}if(x==false){return 0}c=[];return fin(c,p,22,_ReturnStatement(c),a)}
 function WithStatement(a){var x,p=pos,c;if(x=tbl[p][23]){pos=x[1];a.push([p,23]);return 1}if(x==false){return 0}c=[];return fin(c,p,23,_WithStatement(c),a)}
 function LabelledStatement(a){var x,p=pos,c;if(x=tbl[p][24]){pos=x[1];a.push([p,24]);return 1}if(x==false){return 0}c=[];return fin(c,p,24,_LabelledStatement(c),a)}
 function SwitchStatement(a){var x,p=pos,c;if(x=tbl[p][25]){pos=x[1];a.push([p,25]);return 1}if(x==false){return 0}c=[];return fin(c,p,25,_SwitchStatement(c),a)}
 function CaseClause(a){var x,p=pos,c;if(x=tbl[p][26]){pos=x[1];a.push([p,26]);return 1}if(x==false){return 0}c=[];return fin(c,p,26,_CaseClause(c),a)}
 function DefaultClause(a){var x,p=pos,c;if(x=tbl[p][27]){pos=x[1];a.push([p,27]);return 1}if(x==false){return 0}c=[];return fin(c,p,27,_DefaultClause(c),a)}
 function ThrowStatement(a){var x,p=pos,c;if(x=tbl[p][28]){pos=x[1];a.push([p,28]);return 1}if(x==false){return 0}c=[];return fin(c,p,28,_ThrowStatement(c),a)}
 function TryStatement(a){var x,p=pos,c;if(x=tbl[p][29]){pos=x[1];a.push([p,29]);return 1}if(x==false){return 0}c=[];return fin(c,p,29,_TryStatement(c),a)}
 function Catch(a){var x,p=pos,c;if(x=tbl[p][30]){pos=x[1];a.push([p,30]);return 1}if(x==false){return 0}c=[];return fin(c,p,30,_Catch(c),a)}
 function Finally(a){var x,p=pos,c;if(x=tbl[p][31]){pos=x[1];a.push([p,31]);return 1}if(x==false){return 0}c=[];return fin(c,p,31,_Finally(c),a)}
 function DebuggerStatement(a){var x,p=pos,c;if(x=tbl[p][32]){pos=x[1];a.push([p,32]);return 1}if(x==false){return 0}c=[];return fin(c,p,32,_DebuggerStatement(c),a)}
 function Expr(a){var x,p=pos,c;if(x=tbl[p][33]){pos=x[1];a.push([p,33]);return 1}if(x==false){return 0}c=[];return fin(c,p,33,_Expr(c),a)}
 function ExprNoIn(a){var x,p=pos,c;if(x=tbl[p][34]){pos=x[1];a.push([p,34]);return 1}if(x==false){return 0}c=[];return fin(c,p,34,_ExprNoIn(c),a)}
 function AssignmentExpr(a){var x,p=pos,c;if(x=tbl[p][35]){pos=x[1];a.push([p,35]);return 1}if(x==false){return 0}c=[];return fin(c,p,35,_AssignmentExpr(c),a)}
 function AssignmentExprNoIn(a){var x,p=pos,c;if(x=tbl[p][36]){pos=x[1];a.push([p,36]);return 1}if(x==false){return 0}c=[];return fin(c,p,36,_AssignmentExprNoIn(c),a)}
 function AssignmentOperator(a){var x,p=pos,c;if(x=tbl[p][37]){pos=x[1];a.push([p,37]);return 1}if(x==false){return 0}c=[];return fin(c,p,37,_AssignmentOperator(c),a)}
 function ConditionalExpr(a){var x,p=pos,c;if(x=tbl[p][38]){pos=x[1];a.push([p,38]);return 1}if(x==false){return 0}c=[];return fin(c,p,38,_ConditionalExpr(c),a)}
 function ConditionalExprNoIn(a){var x,p=pos,c;if(x=tbl[p][39]){pos=x[1];a.push([p,39]);return 1}if(x==false){return 0}c=[];return fin(c,p,39,_ConditionalExprNoIn(c),a)}
 function LogicalOrExpr(a){var x,p=pos,c;if(x=tbl[p][40]){pos=x[1];a.push([p,40]);return 1}if(x==false){return 0}c=[];return fin(c,p,40,_LogicalOrExpr(c),a)}
 function LogicalOrExprNoIn(a){var x,p=pos,c;if(x=tbl[p][41]){pos=x[1];a.push([p,41]);return 1}if(x==false){return 0}c=[];return fin(c,p,41,_LogicalOrExprNoIn(c),a)}
 function LogicalAndExpr(a){var x,p=pos,c;if(x=tbl[p][42]){pos=x[1];a.push([p,42]);return 1}if(x==false){return 0}c=[];return fin(c,p,42,_LogicalAndExpr(c),a)}
 function LogicalAndExprNoIn(a){var x,p=pos,c;if(x=tbl[p][43]){pos=x[1];a.push([p,43]);return 1}if(x==false){return 0}c=[];return fin(c,p,43,_LogicalAndExprNoIn(c),a)}
 function BitwiseOrExpr(a){var x,p=pos,c;if(x=tbl[p][44]){pos=x[1];a.push([p,44]);return 1}if(x==false){return 0}c=[];return fin(c,p,44,_BitwiseOrExpr(c),a)}
 function BitwiseOrExprNoIn(a){var x,p=pos,c;if(x=tbl[p][45]){pos=x[1];a.push([p,45]);return 1}if(x==false){return 0}c=[];return fin(c,p,45,_BitwiseOrExprNoIn(c),a)}
 function BitwiseXOrExpr(a){var x,p=pos,c;if(x=tbl[p][46]){pos=x[1];a.push([p,46]);return 1}if(x==false){return 0}c=[];return fin(c,p,46,_BitwiseXOrExpr(c),a)}
 function BitwiseXOrExprNoIn(a){var x,p=pos,c;if(x=tbl[p][47]){pos=x[1];a.push([p,47]);return 1}if(x==false){return 0}c=[];return fin(c,p,47,_BitwiseXOrExprNoIn(c),a)}
 function BitwiseAndExpr(a){var x,p=pos,c;if(x=tbl[p][48]){pos=x[1];a.push([p,48]);return 1}if(x==false){return 0}c=[];return fin(c,p,48,_BitwiseAndExpr(c),a)}
 function BitwiseAndExprNoIn(a){var x,p=pos,c;if(x=tbl[p][49]){pos=x[1];a.push([p,49]);return 1}if(x==false){return 0}c=[];return fin(c,p,49,_BitwiseAndExprNoIn(c),a)}
 function EqualityExpr(a){var x,p=pos,c;if(x=tbl[p][50]){pos=x[1];a.push([p,50]);return 1}if(x==false){return 0}c=[];return fin(c,p,50,_EqualityExpr(c),a)}
 function EqualityExprNoIn(a){var x,p=pos,c;if(x=tbl[p][51]){pos=x[1];a.push([p,51]);return 1}if(x==false){return 0}c=[];return fin(c,p,51,_EqualityExprNoIn(c),a)}
 function EqualityOp(a){var x,p=pos,c;if(x=tbl[p][52]){pos=x[1];a.push([p,52]);return 1}if(x==false){return 0}c=[];return fin(c,p,52,_EqualityOp(c),a)}
 function RelationalExpr(a){var x,p=pos,c;if(x=tbl[p][53]){pos=x[1];a.push([p,53]);return 1}if(x==false){return 0}c=[];return fin(c,p,53,_RelationalExpr(c),a)}
 function RelationalExprNoIn(a){var x,p=pos,c;if(x=tbl[p][54]){pos=x[1];a.push([p,54]);return 1}if(x==false){return 0}c=[];return fin(c,p,54,_RelationalExprNoIn(c),a)}
 function RelationalOp(a){var x,p=pos,c;if(x=tbl[p][55]){pos=x[1];a.push([p,55]);return 1}if(x==false){return 0}c=[];return fin(c,p,55,_RelationalOp(c),a)}
 function RelationalOpNoIn(a){var x,p=pos,c;if(x=tbl[p][56]){pos=x[1];a.push([p,56]);return 1}if(x==false){return 0}c=[];return fin(c,p,56,_RelationalOpNoIn(c),a)}
 function ShiftExpr(a){var x,p=pos,c;if(x=tbl[p][57]){pos=x[1];a.push([p,57]);return 1}if(x==false){return 0}c=[];return fin(c,p,57,_ShiftExpr(c),a)}
 function ShiftOp(a){var x,p=pos,c;if(x=tbl[p][58]){pos=x[1];a.push([p,58]);return 1}if(x==false){return 0}c=[];return fin(c,p,58,_ShiftOp(c),a)}
 function AdditiveExpr(a){var x,p=pos,c;if(x=tbl[p][59]){pos=x[1];a.push([p,59]);return 1}if(x==false){return 0}c=[];return fin(c,p,59,_AdditiveExpr(c),a)}
 function AdditiveOp(a){var x,p=pos,c;if(x=tbl[p][60]){pos=x[1];a.push([p,60]);return 1}if(x==false){return 0}c=[];return fin(c,p,60,_AdditiveOp(c),a)}
 function MultiplicativeExpr(a){var x,p=pos,c;if(x=tbl[p][61]){pos=x[1];a.push([p,61]);return 1}if(x==false){return 0}c=[];return fin(c,p,61,_MultiplicativeExpr(c),a)}
 function MultiplicativeOp(a){var x,p=pos,c;if(x=tbl[p][62]){pos=x[1];a.push([p,62]);return 1}if(x==false){return 0}c=[];return fin(c,p,62,_MultiplicativeOp(c),a)}
 function UnaryExpr(a){var x,p=pos,c;if(x=tbl[p][63]){pos=x[1];a.push([p,63]);return 1}if(x==false){return 0}c=[];return fin(c,p,63,_UnaryExpr(c),a)}
 function PostfixExpr(a){var x,p=pos,c;if(x=tbl[p][64]){pos=x[1];a.push([p,64]);return 1}if(x==false){return 0}c=[];return fin(c,p,64,_PostfixExpr(c),a)}
 function LeftHandSideExpr(a){var x,p=pos,c;if(x=tbl[p][65]){pos=x[1];a.push([p,65]);return 1}if(x==false){return 0}c=[];return fin(c,p,65,_LeftHandSideExpr(c),a)}
 function CallExpr(a){var x,p=pos,c;if(x=tbl[p][66]){pos=x[1];a.push([p,66]);return 1}if(x==false){return 0}c=[];return fin(c,p,66,_CallExpr(c),a)}
 function Arguments(a){var x,p=pos,c;if(x=tbl[p][67]){pos=x[1];a.push([p,67]);return 1}if(x==false){return 0}c=[];return fin(c,p,67,_Arguments(c),a)}
 function ArgumentList(a){var x,p=pos,c;if(x=tbl[p][68]){pos=x[1];a.push([p,68]);return 1}if(x==false){return 0}c=[];return fin(c,p,68,_ArgumentList(c),a)}
 function NewExpr(a){var x,p=pos,c;if(x=tbl[p][69]){pos=x[1];a.push([p,69]);return 1}if(x==false){return 0}c=[];return fin(c,p,69,_NewExpr(c),a)}
 function MemberExpr(a){var x,p=pos,c;if(x=tbl[p][70]){pos=x[1];a.push([p,70]);return 1}if(x==false){return 0}c=[];return fin(c,p,70,_MemberExpr(c),a)}
 function PrimaryExpr(a){var x,p=pos,c;if(x=tbl[p][71]){pos=x[1];a.push([p,71]);return 1}if(x==false){return 0}c=[];return fin(c,p,71,_PrimaryExpr(c),a)}
 function ArrayLiteral(a){var x,p=pos,c;if(x=tbl[p][72]){pos=x[1];a.push([p,72]);return 1}if(x==false){return 0}c=[];return fin(c,p,72,_ArrayLiteral(c),a)}
 function ElementList(a){var x,p=pos,c;if(x=tbl[p][73]){pos=x[1];a.push([p,73]);return 1}if(x==false){return 0}c=[];return fin(c,p,73,_ElementList(c),a)}
 function Elision(a){var x,p=pos,c;if(x=tbl[p][74]){pos=x[1];a.push([p,74]);return 1}if(x==false){return 0}c=[];return fin(c,p,74,_Elision(c),a)}
 function ObjectLiteral(a){var x,p=pos,c;if(x=tbl[p][75]){pos=x[1];a.push([p,75]);return 1}if(x==false){return 0}c=[];return fin(c,p,75,_ObjectLiteral(c),a)}
 function PropertyNameAndValueList(a){var x,p=pos,c;if(x=tbl[p][76]){pos=x[1];a.push([p,76]);return 1}if(x==false){return 0}c=[];return fin(c,p,76,_PropertyNameAndValueList(c),a)}
 function PropertyAssignment(a){var x,p=pos,c;if(x=tbl[p][77]){pos=x[1];a.push([p,77]);return 1}if(x==false){return 0}c=[];return fin(c,p,77,_PropertyAssignment(c),a)}
 function PropertyName(a){var x,p=pos,c;if(x=tbl[p][78]){pos=x[1];a.push([p,78]);return 1}if(x==false){return 0}c=[];return fin(c,p,78,_PropertyName(c),a)}
 function PropertySetParameterList(a){var x,p=pos,c;if(x=tbl[p][79]){pos=x[1];a.push([p,79]);return 1}if(x==false){return 0}c=[];return fin(c,p,79,_PropertySetParameterList(c),a)}
 function Literal(a){var x,p=pos,c;if(x=tbl[p][80]){pos=x[1];a.push([p,80]);return 1}if(x==false){return 0}c=[];return fin(c,p,80,_Literal(c),a)}
 function NullLiteral(a){var x,p=pos,c;if(x=tbl[p][81]){pos=x[1];a.push([p,81]);return 1}if(x==false){return 0}c=[];return fin(c,p,81,_NullLiteral(c),a)}
 function BooleanLiteral(a){var x,p=pos,c;if(x=tbl[p][82]){pos=x[1];a.push([p,82]);return 1}if(x==false){return 0}c=[];return fin(c,p,82,_BooleanLiteral(c),a)}
 function NumericLiteral(a){var x,p=pos,c;if(x=tbl[p][83]){pos=x[1];a.push([p,83]);return 1}if(x==false){return 0}c=[];return fin(c,p,83,_NumericLiteral(c),a)}
 function DecimalLiteral(a){var x,p=pos,c;if(x=tbl[p][84]){pos=x[1];a.push([p,84]);return 1}if(x==false){return 0}c=[];return fin(c,p,84,_DecimalLiteral(c),a)}
 function DecimalIntegerLiteral(a){var x,p=pos,c;if(x=tbl[p][85]){pos=x[1];a.push([p,85]);return 1}if(x==false){return 0}c=[];return fin(c,p,85,_DecimalIntegerLiteral(c),a)}
 function DecimalDigit(a){var x,p=pos,c;if(x=tbl[p][86]){pos=x[1];a.push([p,86]);return 1}if(x==false){return 0}c=[];return fin(c,p,86,_DecimalDigit(c),a)}
 function ExponentPart(a){var x,p=pos,c;if(x=tbl[p][87]){pos=x[1];a.push([p,87]);return 1}if(x==false){return 0}c=[];return fin(c,p,87,_ExponentPart(c),a)}
 function SignedInteger(a){var x,p=pos,c;if(x=tbl[p][88]){pos=x[1];a.push([p,88]);return 1}if(x==false){return 0}c=[];return fin(c,p,88,_SignedInteger(c),a)}
 function HexIntegerLiteral(a){var x,p=pos,c;if(x=tbl[p][89]){pos=x[1];a.push([p,89]);return 1}if(x==false){return 0}c=[];return fin(c,p,89,_HexIntegerLiteral(c),a)}
 function DQ(a){var x,p=pos,c;if(x=tbl[p][90]){pos=x[1];a.push([p,90]);return 1}if(x==false){return 0}c=[];return fin(c,p,90,_DQ(c),a)}
 function SQ(a){var x,p=pos,c;if(x=tbl[p][91]){pos=x[1];a.push([p,91]);return 1}if(x==false){return 0}c=[];return fin(c,p,91,_SQ(c),a)}
 function StringLiteral(a){var x,p=pos,c;if(x=tbl[p][92]){pos=x[1];a.push([p,92]);return 1}if(x==false){return 0}c=[];return fin(c,p,92,_StringLiteral(c),a)}
 function RS(a){var x,p=pos,c;if(x=tbl[p][93]){pos=x[1];a.push([p,93]);return 1}if(x==false){return 0}c=[];return fin(c,p,93,_RS(c),a)}
 function DoubleStringCharacter(a){var x,p=pos,c;if(x=tbl[p][94]){pos=x[1];a.push([p,94]);return 1}if(x==false){return 0}c=[];return fin(c,p,94,_DoubleStringCharacter(c),a)}
 function SingleStringCharacter(a){var x,p=pos,c;if(x=tbl[p][95]){pos=x[1];a.push([p,95]);return 1}if(x==false){return 0}c=[];return fin(c,p,95,_SingleStringCharacter(c),a)}
 function LineContinuation(a){var x,p=pos,c;if(x=tbl[p][96]){pos=x[1];a.push([p,96]);return 1}if(x==false){return 0}c=[];return fin(c,p,96,_LineContinuation(c),a)}
 function EscapeSequence(a){var x,p=pos,c;if(x=tbl[p][97]){pos=x[1];a.push([p,97]);return 1}if(x==false){return 0}c=[];return fin(c,p,97,_EscapeSequence(c),a)}
 function CharacterEscapeSequence(a){var x,p=pos,c;if(x=tbl[p][98]){pos=x[1];a.push([p,98]);return 1}if(x==false){return 0}c=[];return fin(c,p,98,_CharacterEscapeSequence(c),a)}
 function SingleEscapeCharacter(a){var x,p=pos,c;if(x=tbl[p][99]){pos=x[1];a.push([p,99]);return 1}if(x==false){return 0}c=[];return fin(c,p,99,_SingleEscapeCharacter(c),a)}
 function NonEscapeCharacter(a){var x,p=pos,c;if(x=tbl[p][100]){pos=x[1];a.push([p,100]);return 1}if(x==false){return 0}c=[];return fin(c,p,100,_NonEscapeCharacter(c),a)}
 function EscapeCharacter(a){var x,p=pos,c;if(x=tbl[p][101]){pos=x[1];a.push([p,101]);return 1}if(x==false){return 0}c=[];return fin(c,p,101,_EscapeCharacter(c),a)}
 function HexEscapeSequence(a){var x,p=pos,c;if(x=tbl[p][102]){pos=x[1];a.push([p,102]);return 1}if(x==false){return 0}c=[];return fin(c,p,102,_HexEscapeSequence(c),a)}
 function UnicodeEscapeSequence(a){var x,p=pos,c;if(x=tbl[p][103]){pos=x[1];a.push([p,103]);return 1}if(x==false){return 0}c=[];return fin(c,p,103,_UnicodeEscapeSequence(c),a)}
 function RegularExpressionLiteral(a){var x,p=pos,c;if(x=tbl[p][104]){pos=x[1];a.push([p,104]);return 1}if(x==false){return 0}c=[];return fin(c,p,104,_RegularExpressionLiteral(c),a)}
 function RegularExpressionBody(a){var x,p=pos,c;if(x=tbl[p][105]){pos=x[1];a.push([p,105]);return 1}if(x==false){return 0}c=[];return fin(c,p,105,_RegularExpressionBody(c),a)}
 function RegularExpressionFirstChar(a){var x,p=pos,c;if(x=tbl[p][106]){pos=x[1];a.push([p,106]);return 1}if(x==false){return 0}c=[];return fin(c,p,106,_RegularExpressionFirstChar(c),a)}
 function RegularExpressionChar(a){var x,p=pos,c;if(x=tbl[p][107]){pos=x[1];a.push([p,107]);return 1}if(x==false){return 0}c=[];return fin(c,p,107,_RegularExpressionChar(c),a)}
 function RegularExpressionBackslashSequence(a){var x,p=pos,c;if(x=tbl[p][108]){pos=x[1];a.push([p,108]);return 1}if(x==false){return 0}c=[];return fin(c,p,108,_RegularExpressionBackslashSequence(c),a)}
 function RegularExpressionClass(a){var x,p=pos,c;if(x=tbl[p][109]){pos=x[1];a.push([p,109]);return 1}if(x==false){return 0}c=[];return fin(c,p,109,_RegularExpressionClass(c),a)}
 function RegularExpressionClassChar(a){var x,p=pos,c;if(x=tbl[p][110]){pos=x[1];a.push([p,110]);return 1}if(x==false){return 0}c=[];return fin(c,p,110,_RegularExpressionClassChar(c),a)}
 function RegularExpressionFlags(a){var x,p=pos,c;if(x=tbl[p][111]){pos=x[1];a.push([p,111]);return 1}if(x==false){return 0}c=[];return fin(c,p,111,_RegularExpressionFlags(c),a)}
 function SourceCharacter(a){var x,p=pos,c;if(x=tbl[p][112]){pos=x[1];a.push([p,112]);return 1}if(x==false){return 0}c=[];return fin(c,p,112,_SourceCharacter(c),a)}
 function WhiteSpace(a){var x,p=pos,c;if(x=tbl[p][113]){pos=x[1];a.push([p,113]);return 1}if(x==false){return 0}c=[];return fin(c,p,113,_WhiteSpace(c),a)}
 function LF(a){var x,p=pos,c;if(x=tbl[p][114]){pos=x[1];a.push([p,114]);return 1}if(x==false){return 0}c=[];return fin(c,p,114,_LF(c),a)}
 function CR(a){var x,p=pos,c;if(x=tbl[p][115]){pos=x[1];a.push([p,115]);return 1}if(x==false){return 0}c=[];return fin(c,p,115,_CR(c),a)}
 function LS(a){var x,p=pos,c;if(x=tbl[p][116]){pos=x[1];a.push([p,116]);return 1}if(x==false){return 0}c=[];return fin(c,p,116,_LS(c),a)}
 function PS(a){var x,p=pos,c;if(x=tbl[p][117]){pos=x[1];a.push([p,117]);return 1}if(x==false){return 0}c=[];return fin(c,p,117,_PS(c),a)}
 function LineTerminator(a){var x,p=pos,c;if(x=tbl[p][118]){pos=x[1];a.push([p,118]);return 1}if(x==false){return 0}c=[];return fin(c,p,118,_LineTerminator(c),a)}
 function LineTerminatorSequence(a){var x,p=pos,c;if(x=tbl[p][119]){pos=x[1];a.push([p,119]);return 1}if(x==false){return 0}c=[];return fin(c,p,119,_LineTerminatorSequence(c),a)}
 function Comment(a){var x,p=pos,c;if(x=tbl[p][120]){pos=x[1];a.push([p,120]);return 1}if(x==false){return 0}c=[];return fin(c,p,120,_Comment(c),a)}
 function MultiLineComment(a){var x,p=pos,c;if(x=tbl[p][121]){pos=x[1];a.push([p,121]);return 1}if(x==false){return 0}c=[];return fin(c,p,121,_MultiLineComment(c),a)}
 function MultiLineCommentNoLB(a){var x,p=pos,c;if(x=tbl[p][122]){pos=x[1];a.push([p,122]);return 1}if(x==false){return 0}c=[];return fin(c,p,122,_MultiLineCommentNoLB(c),a)}
 function SingleLineComment(a){var x,p=pos,c;if(x=tbl[p][123]){pos=x[1];a.push([p,123]);return 1}if(x==false){return 0}c=[];return fin(c,p,123,_SingleLineComment(c),a)}
 function S(a){var x,p=pos,c;if(x=tbl[p][124]){pos=x[1];a.push([p,124]);return 1}if(x==false){return 0}c=[];return fin(c,p,124,_S(c),a)}
 function SnoLB(a){var x,p=pos,c;if(x=tbl[p][125]){pos=x[1];a.push([p,125]);return 1}if(x==false){return 0}c=[];return fin(c,p,125,_SnoLB(c),a)}
 function EOS(a){var x,p=pos,c;if(x=tbl[p][126]){pos=x[1];a.push([p,126]);return 1}if(x==false){return 0}c=[];return fin(c,p,126,_EOS(c),a)}
 function EOSnoLB(a){var x,p=pos,c;if(x=tbl[p][127]){pos=x[1];a.push([p,127]);return 1}if(x==false){return 0}c=[];return fin(c,p,127,_EOSnoLB(c),a)}
 function EOF(a){var x,p=pos,c;if(x=tbl[p][128]){pos=x[1];a.push([p,128]);return 1}if(x==false){return 0}c=[];return fin(c,p,128,_EOF(c),a)}
 function ReservedWord(a){var x,p=pos,c;if(x=tbl[p][129]){pos=x[1];a.push([p,129]);return 1}if(x==false){return 0}c=[];return fin(c,p,129,_ReservedWord(c),a)}
 function Keyword(a){var x,p=pos,c;if(x=tbl[p][130]){pos=x[1];a.push([p,130]);return 1}if(x==false){return 0}c=[];return fin(c,p,130,_Keyword(c),a)}
 function FutureReservedWord(a){var x,p=pos,c;if(x=tbl[p][131]){pos=x[1];a.push([p,131]);return 1}if(x==false){return 0}c=[];return fin(c,p,131,_FutureReservedWord(c),a)}
 function Identifier(a){var x,p=pos,c;if(x=tbl[p][132]){pos=x[1];a.push([p,132]);return 1}if(x==false){return 0}c=[];return fin(c,p,132,_Identifier(c),a)}
 function IdentifierName(a){var x,p=pos,c;if(x=tbl[p][133]){pos=x[1];a.push([p,133]);return 1}if(x==false){return 0}c=[];return fin(c,p,133,_IdentifierName(c),a)}
 function IdentifierStart(a){var x,p=pos,c;if(x=tbl[p][134]){pos=x[1];a.push([p,134]);return 1}if(x==false){return 0}c=[];return fin(c,p,134,_IdentifierStart(c),a)}
 function IdentifierPart(a){var x,p=pos,c;if(x=tbl[p][135]){pos=x[1];a.push([p,135]);return 1}if(x==false){return 0}c=[];return fin(c,p,135,_IdentifierPart(c),a)}
 function UnicodeLetter(a){var x,p=pos,c;if(x=tbl[p][136]){pos=x[1];a.push([p,136]);return 1}if(x==false){return 0}c=[];return fin(c,p,136,_UnicodeLetter(c),a)}
 function HexDigit(a){var x,p=pos,c;if(x=tbl[p][137]){pos=x[1];a.push([p,137]);return 1}if(x==false){return 0}c=[];return fin(c,p,137,_HexDigit(c),a)}
 function FalseTok(a){var x,p=pos,c;if(x=tbl[p][138]){pos=x[1];a.push([p,138]);return 1}if(x==false){return 0}c=[];return fin(c,p,138,_FalseTok(c),a)}
 function TrueTok(a){var x,p=pos,c;if(x=tbl[p][139]){pos=x[1];a.push([p,139]);return 1}if(x==false){return 0}c=[];return fin(c,p,139,_TrueTok(c),a)}
 function NullTok(a){var x,p=pos,c;if(x=tbl[p][140]){pos=x[1];a.push([p,140]);return 1}if(x==false){return 0}c=[];return fin(c,p,140,_NullTok(c),a)}
 function BreakTok(a){var x,p=pos,c;if(x=tbl[p][141]){pos=x[1];a.push([p,141]);return 1}if(x==false){return 0}c=[];return fin(c,p,141,_BreakTok(c),a)}
 function ContinueTok(a){var x,p=pos,c;if(x=tbl[p][142]){pos=x[1];a.push([p,142]);return 1}if(x==false){return 0}c=[];return fin(c,p,142,_ContinueTok(c),a)}
 function DebuggerTok(a){var x,p=pos,c;if(x=tbl[p][143]){pos=x[1];a.push([p,143]);return 1}if(x==false){return 0}c=[];return fin(c,p,143,_DebuggerTok(c),a)}
 function InTok(a){var x,p=pos,c;if(x=tbl[p][144]){pos=x[1];a.push([p,144]);return 1}if(x==false){return 0}c=[];return fin(c,p,144,_InTok(c),a)}
 function InstanceOfTok(a){var x,p=pos,c;if(x=tbl[p][145]){pos=x[1];a.push([p,145]);return 1}if(x==false){return 0}c=[];return fin(c,p,145,_InstanceOfTok(c),a)}
 function DeleteTok(a){var x,p=pos,c;if(x=tbl[p][146]){pos=x[1];a.push([p,146]);return 1}if(x==false){return 0}c=[];return fin(c,p,146,_DeleteTok(c),a)}
 function FunctionTok(a){var x,p=pos,c;if(x=tbl[p][147]){pos=x[1];a.push([p,147]);return 1}if(x==false){return 0}c=[];return fin(c,p,147,_FunctionTok(c),a)}
 function NewTok(a){var x,p=pos,c;if(x=tbl[p][148]){pos=x[1];a.push([p,148]);return 1}if(x==false){return 0}c=[];return fin(c,p,148,_NewTok(c),a)}
 function ThisTok(a){var x,p=pos,c;if(x=tbl[p][149]){pos=x[1];a.push([p,149]);return 1}if(x==false){return 0}c=[];return fin(c,p,149,_ThisTok(c),a)}
 function TypeofTok(a){var x,p=pos,c;if(x=tbl[p][150]){pos=x[1];a.push([p,150]);return 1}if(x==false){return 0}c=[];return fin(c,p,150,_TypeofTok(c),a)}
 function VoidTok(a){var x,p=pos,c;if(x=tbl[p][151]){pos=x[1];a.push([p,151]);return 1}if(x==false){return 0}c=[];return fin(c,p,151,_VoidTok(c),a)}
 function IfTok(a){var x,p=pos,c;if(x=tbl[p][152]){pos=x[1];a.push([p,152]);return 1}if(x==false){return 0}c=[];return fin(c,p,152,_IfTok(c),a)}
 function ElseTok(a){var x,p=pos,c;if(x=tbl[p][153]){pos=x[1];a.push([p,153]);return 1}if(x==false){return 0}c=[];return fin(c,p,153,_ElseTok(c),a)}
 function DoTok(a){var x,p=pos,c;if(x=tbl[p][154]){pos=x[1];a.push([p,154]);return 1}if(x==false){return 0}c=[];return fin(c,p,154,_DoTok(c),a)}
 function WhileTok(a){var x,p=pos,c;if(x=tbl[p][155]){pos=x[1];a.push([p,155]);return 1}if(x==false){return 0}c=[];return fin(c,p,155,_WhileTok(c),a)}
 function ForTok(a){var x,p=pos,c;if(x=tbl[p][156]){pos=x[1];a.push([p,156]);return 1}if(x==false){return 0}c=[];return fin(c,p,156,_ForTok(c),a)}
 function VarTok(a){var x,p=pos,c;if(x=tbl[p][157]){pos=x[1];a.push([p,157]);return 1}if(x==false){return 0}c=[];return fin(c,p,157,_VarTok(c),a)}
 function ReturnTok(a){var x,p=pos,c;if(x=tbl[p][158]){pos=x[1];a.push([p,158]);return 1}if(x==false){return 0}c=[];return fin(c,p,158,_ReturnTok(c),a)}
 function CaseTok(a){var x,p=pos,c;if(x=tbl[p][159]){pos=x[1];a.push([p,159]);return 1}if(x==false){return 0}c=[];return fin(c,p,159,_CaseTok(c),a)}
 function DefaultTok(a){var x,p=pos,c;if(x=tbl[p][160]){pos=x[1];a.push([p,160]);return 1}if(x==false){return 0}c=[];return fin(c,p,160,_DefaultTok(c),a)}
 function SwitchTok(a){var x,p=pos,c;if(x=tbl[p][161]){pos=x[1];a.push([p,161]);return 1}if(x==false){return 0}c=[];return fin(c,p,161,_SwitchTok(c),a)}
 function ThrowTok(a){var x,p=pos,c;if(x=tbl[p][162]){pos=x[1];a.push([p,162]);return 1}if(x==false){return 0}c=[];return fin(c,p,162,_ThrowTok(c),a)}
 function CatchTok(a){var x,p=pos,c;if(x=tbl[p][163]){pos=x[1];a.push([p,163]);return 1}if(x==false){return 0}c=[];return fin(c,p,163,_CatchTok(c),a)}
 function FinallyTok(a){var x,p=pos,c;if(x=tbl[p][164]){pos=x[1];a.push([p,164]);return 1}if(x==false){return 0}c=[];return fin(c,p,164,_FinallyTok(c),a)}
 function TryTok(a){var x,p=pos,c;if(x=tbl[p][165]){pos=x[1];a.push([p,165]);return 1}if(x==false){return 0}c=[];return fin(c,p,165,_TryTok(c),a)}
 function WithTok(a){var x,p=pos,c;if(x=tbl[p][166]){pos=x[1];a.push([p,166]);return 1}if(x==false){return 0}c=[];return fin(c,p,166,_WithTok(c),a)}
 var _Program=q(r(0,0,q(r(0,1,S),o(Statement,FunctionDeclaration))),r(0,1,S))
 var _FunctionBody=q(r(0,0,q(r(0,1,S),o(Statement,FunctionDeclaration))),r(0,1,S))
 var _FunctionDeclaration=q(FunctionTok,r(0,1,S),Identifier,r(0,1,S),sl_0,r(0,1,S),r(0,1,FormalParameterList),r(0,1,S),sl_1,r(0,1,S),sl_2,r(0,1,S),FunctionBody,r(0,1,S),sl_3)
 var _FunctionExpr=q(FunctionTok,r(0,1,S),r(0,1,Identifier),r(0,1,S),sl_0,r(0,1,S),r(0,1,FormalParameterList),r(0,1,S),sl_1,r(0,1,S),sl_2,r(0,1,S),FunctionBody,r(0,1,S),sl_3)
 var _FormalParameterList=q(Identifier,r(0,0,q(sl_4,r(0,1,S),Identifier)))
 var _UseStrictDirective=q(sl_5,S,sl_6,S,r(0,0,q(sl_4,n(LineTerminator),SourceCharacter)))
 var _Statement=o(Block,VariableStatement,EmptyStatement,ExprStatement,IfStatement,IterationStatement,ContinueStatement,BreakStatement,ReturnStatement,WithStatement,LabelledStatement,SwitchStatement,ThrowStatement,TryStatement,DebuggerStatement)
 var _Block=q(sl_2,r(0,0,q(r(0,1,S),Statement)),r(0,1,S),sl_3)
 var _VariableStatement=q(VarTok,r(0,1,S),VariableDeclaration,r(0,0,q(r(0,1,S),sl_4,r(0,1,S),VariableDeclaration)),EOS)
 var _VariableDeclarationListNoIn=q(VariableDeclarationNoIn,r(0,0,q(r(0,1,S),sl_4,r(0,1,S),VariableDeclarationNoIn)))
 var _VariableDeclaration=q(Identifier,r(0,1,q(r(0,1,S),sl_7,n(sl_7),r(0,1,S),AssignmentExpr)))
 var _VariableDeclarationNoIn=q(Identifier,r(0,1,q(r(0,1,S),sl_7,n(sl_7),r(0,1,S),AssignmentExprNoIn)))
 var _EmptyStatement=sl_8
 var _ExprStatement=q(n(o(sl_2,FunctionTok)),Expr,EOS)
 var _IfStatement=q(IfTok,r(0,1,S),sl_0,r(0,1,S),Expr,r(0,1,S),sl_1,r(0,1,S),Statement,r(0,1,q(r(0,1,S),ElseTok,r(0,1,S),Statement)))
 var _IterationStatement=o(DoWhileStatement,WhileStatement,ForInStatement,ForStatement)
 var _DoWhileStatement=q(DoTok,r(0,1,S),Statement,r(0,1,S),WhileTok,r(0,1,S),sl_0,r(0,1,S),Expr,r(0,1,S),sl_1,EOS)
 var _WhileStatement=q(WhileTok,r(0,1,S),sl_0,r(0,1,S),Expr,r(0,1,S),sl_1,r(0,1,S),Statement)
 var _ForInStatement=o(q(ForTok,r(0,1,S),sl_0,r(0,1,S),LeftHandSideExpr,r(0,1,S),InTok,r(0,1,S),Expr,r(0,1,S),sl_1,r(0,1,S),Statement),q(ForTok,r(0,1,S),sl_0,r(0,1,S),VarTok,r(0,1,S),VariableDeclarationNoIn,r(0,1,S),InTok,r(0,1,S),Expr,r(0,1,S),sl_1,r(0,1,S),Statement))
 var _ForStatement=o(q(ForTok,r(0,1,S),sl_0,r(0,1,S),r(0,1,ExprNoIn),r(0,1,S),sl_8,r(0,1,S),r(0,1,Expr),r(0,1,S),sl_8,r(0,1,S),r(0,1,Expr),r(0,1,S),sl_1,r(0,1,S),Statement),q(ForTok,r(0,1,S),sl_0,r(0,1,S),VarTok,r(0,1,S),VariableDeclarationListNoIn,r(0,1,S),sl_8,r(0,1,S),r(0,1,Expr),r(0,1,S),sl_8,r(0,1,S),r(0,1,Expr),r(0,1,S),sl_1,r(0,1,S),Statement))
 var _ContinueStatement=q(ContinueTok,r(0,1,SnoLB),o(q(Identifier,EOS),EOSnoLB))
 var _BreakStatement=q(BreakTok,r(0,1,SnoLB),o(q(Identifier,EOS),EOSnoLB))
 var _ReturnStatement=q(ReturnTok,r(0,1,SnoLB),o(EOSnoLB,q(Expr,EOS)))
 var _WithStatement=q(WithTok,r(0,1,S),sl_0,r(0,1,S),Expr,r(0,1,S),sl_1,r(0,1,S),Statement)
 var _LabelledStatement=q(Identifier,r(0,1,S),sl_9,r(0,1,S),Statement)
 var _SwitchStatement=q(SwitchTok,r(0,1,S),sl_0,r(0,1,S),Expr,r(0,1,S),sl_1,r(0,1,S),sl_2,r(0,0,CaseClause),r(0,1,q(DefaultClause,r(0,0,CaseClause))),r(0,1,S),sl_3)
 var _CaseClause=q(r(0,1,S),CaseTok,r(0,1,S),Expr,r(0,1,S),sl_9,r(0,0,q(r(0,1,S),Statement)))
 var _DefaultClause=q(r(0,1,S),DefaultTok,r(0,1,S),sl_9,r(0,0,q(r(0,1,S),Statement)))
 var _ThrowStatement=q(ThrowTok,r(0,1,SnoLB),o(EOSnoLB,q(Expr,EOS)))
 var _TryStatement=q(TryTok,r(0,1,S),Block,r(0,1,S),o(q(Catch,r(0,1,S),r(0,1,Finally)),Finally))
 var _Catch=q(CatchTok,r(0,1,S),sl_0,r(0,1,S),Identifier,r(0,1,S),sl_1,r(0,1,S),Block)
 var _Finally=q(FinallyTok,r(0,1,S),Block)
 var _DebuggerStatement=q(DebuggerTok,r(0,1,S),EOS)
 var _Expr=q(AssignmentExpr,r(0,0,q(r(0,1,S),sl_4,r(0,1,S),AssignmentExpr)))
 var _ExprNoIn=q(AssignmentExprNoIn,r(0,0,q(r(0,1,S),sl_4,r(0,1,S),AssignmentExprNoIn)))
 var _AssignmentExpr=o(q(LeftHandSideExpr,r(0,1,S),AssignmentOperator,r(0,1,S),AssignmentExpr),ConditionalExpr)
 var _AssignmentExprNoIn=o(q(LeftHandSideExpr,r(0,1,S),AssignmentOperator,r(0,1,S),AssignmentExprNoIn),ConditionalExprNoIn)
 var _AssignmentOperator=o(q(sl_7,n(sl_7)),sl_10,sl_11,sl_12,sl_13,sl_14,sl_15,sl_16,sl_17,sl_18,sl_19,sl_20)
 var _ConditionalExpr=q(LogicalOrExpr,r(0,1,q(r(0,1,S),sl_21,r(0,1,S),AssignmentExpr,r(0,1,S),sl_9,r(0,1,S),AssignmentExpr)))
 var _ConditionalExprNoIn=q(LogicalOrExprNoIn,r(0,1,q(r(0,1,S),sl_21,r(0,1,S),AssignmentExprNoIn,r(0,1,S),sl_9,r(0,1,S),AssignmentExprNoIn)))
 var _LogicalOrExpr=q(LogicalAndExpr,r(0,0,q(r(0,1,S),sl_22,r(0,1,S),LogicalAndExpr)))
 var _LogicalOrExprNoIn=q(LogicalAndExprNoIn,r(0,0,q(r(0,1,S),sl_22,r(0,1,S),LogicalAndExprNoIn)))
 var _LogicalAndExpr=q(BitwiseOrExpr,r(0,0,q(r(0,1,S),sl_23,r(0,1,S),BitwiseOrExpr)))
 var _LogicalAndExprNoIn=q(BitwiseOrExprNoIn,r(0,0,q(r(0,1,S),sl_23,r(0,1,S),BitwiseOrExprNoIn)))
 var _BitwiseOrExpr=q(BitwiseXOrExpr,r(0,0,q(r(0,1,S),sl_24,n(sl_7),r(0,1,S),BitwiseXOrExpr)))
 var _BitwiseOrExprNoIn=q(BitwiseXOrExprNoIn,r(0,0,q(r(0,1,S),sl_24,n(sl_7),r(0,1,S),BitwiseXOrExprNoIn)))
 var _BitwiseXOrExpr=q(BitwiseAndExpr,r(0,0,q(r(0,1,S),sl_25,n(sl_7),r(0,1,S),BitwiseAndExpr)))
 var _BitwiseXOrExprNoIn=q(BitwiseAndExprNoIn,r(0,0,q(r(0,1,S),sl_25,n(sl_7),r(0,1,S),BitwiseAndExprNoIn)))
 var _BitwiseAndExpr=q(EqualityExpr,r(0,0,q(r(0,1,S),sl_26,n(sl_7),r(0,1,S),EqualityExpr)))
 var _BitwiseAndExprNoIn=q(EqualityExprNoIn,r(0,0,q(r(0,1,S),sl_26,n(sl_7),r(0,1,S),EqualityExprNoIn)))
 var _EqualityExpr=q(RelationalExpr,r(0,0,q(r(0,1,S),EqualityOp,r(0,1,S),RelationalExpr)))
 var _EqualityExprNoIn=q(RelationalExprNoIn,r(0,0,q(r(0,1,S),EqualityOp,r(0,1,S),RelationalExprNoIn)))
 var _EqualityOp=o(sl_27,sl_28,sl_29,sl_30)
 var _RelationalExpr=q(ShiftExpr,r(0,0,q(r(0,1,S),RelationalOp,r(0,1,S),ShiftExpr)))
 var _RelationalExprNoIn=q(ShiftExpr,r(0,0,q(r(0,1,S),RelationalOpNoIn,r(0,1,S),ShiftExpr)))
 var _RelationalOp=o(sl_31,sl_32,sl_33,sl_34,InstanceOfTok,InTok)
 var _RelationalOpNoIn=o(sl_31,sl_32,sl_33,sl_34,InstanceOfTok)
 var _ShiftExpr=q(AdditiveExpr,r(0,0,q(r(0,1,S),ShiftOp,r(0,1,S),AdditiveExpr)))
 var _ShiftOp=o(sl_35,sl_36,sl_37)
 var _AdditiveExpr=q(MultiplicativeExpr,r(0,0,q(r(0,1,S),AdditiveOp,r(0,1,S),MultiplicativeExpr)))
 var _AdditiveOp=o(q(sl_38,n(o(sl_38,sl_7))),q(sl_39,n(o(sl_39,sl_7))))
 var _MultiplicativeExpr=q(UnaryExpr,r(0,0,q(r(0,1,S),MultiplicativeOp,r(0,1,S),UnaryExpr)))
 var _MultiplicativeOp=q(o(sl_40,sl_41,sl_42),n(sl_7))
 var _UnaryExpr=o(PostfixExpr,q(DeleteTok,r(0,1,S),UnaryExpr),q(VoidTok,r(0,1,S),UnaryExpr),q(TypeofTok,r(0,1,S),UnaryExpr),q(sl_43,r(0,1,S),UnaryExpr),q(sl_44,r(0,1,S),UnaryExpr),q(sl_38,r(0,1,S),UnaryExpr),q(sl_39,r(0,1,S),UnaryExpr),q(sl_45,r(0,1,S),UnaryExpr),q(sl_46,r(0,1,S),UnaryExpr))
 var _PostfixExpr=q(LeftHandSideExpr,r(0,1,q(r(0,1,SnoLB),o(sl_43,sl_44))))
 var _LeftHandSideExpr=o(CallExpr,NewExpr)
 var _CallExpr=q(MemberExpr,r(0,1,S),Arguments,r(0,0,o(q(r(0,1,S),Arguments),q(r(0,1,S),sl_47,r(0,1,S),Expr,r(0,1,S),sl_48),q(r(0,1,S),sl_49,r(0,1,S),IdentifierName))))
 var _Arguments=q(sl_0,r(0,1,S),r(0,1,ArgumentList),r(0,1,S),sl_1)
 var _ArgumentList=q(AssignmentExpr,r(0,0,q(r(0,1,S),sl_4,r(0,1,S),AssignmentExpr)))
 var _NewExpr=o(MemberExpr,q(NewTok,r(0,1,S),NewExpr))
 var _MemberExpr=q(o(PrimaryExpr,FunctionExpr,q(NewTok,r(0,1,S),MemberExpr,r(0,1,S),Arguments)),r(0,0,o(q(r(0,1,S),sl_47,r(0,1,S),Expr,r(0,1,S),sl_48),q(r(0,1,S),sl_49,r(0,1,S),IdentifierName))))
 var _PrimaryExpr=o(ThisTok,Identifier,Literal,ArrayLiteral,ObjectLiteral,q(sl_0,r(0,1,S),Expr,r(0,1,S),sl_1))
 var _ArrayLiteral=o(q(sl_47,r(0,1,Elision),r(0,1,S),sl_48),q(sl_47,ElementList,r(0,1,S),sl_48),q(sl_47,ElementList,r(0,1,S),sl_4,r(0,1,Elision),r(0,1,S),sl_48))
 var _ElementList=q(r(0,1,Elision),r(0,1,S),AssignmentExpr,r(0,0,q(r(0,1,S),sl_4,r(0,1,Elision),r(0,1,S),AssignmentExpr)))
 var _Elision=r(1,0,q(r(0,1,S),sl_4))
 var _ObjectLiteral=q(sl_2,r(0,1,q(r(0,1,S),PropertyNameAndValueList,r(0,1,S),r(0,1,sl_4))),r(0,1,S),sl_3)
 var _PropertyNameAndValueList=q(PropertyAssignment,r(0,0,q(r(0,1,S),sl_4,r(0,1,S),PropertyAssignment)))
 var _PropertyAssignment=o(q(PropertyName,r(0,1,S),sl_9,r(0,1,S),AssignmentExpr),q(sl_50,r(0,1,S),PropertyName,r(0,1,S),sl_0,r(0,1,S),sl_1,r(0,1,S),sl_2,r(0,1,S),FunctionBody,r(0,1,S),sl_3),q(sl_51,r(0,1,S),PropertyName,r(0,1,S),sl_0,r(0,1,S),PropertySetParameterList,r(0,1,S),sl_1,r(0,1,S),sl_2,r(0,1,S),FunctionBody,r(0,1,S),sl_3))
 var _PropertyName=o(IdentifierName,StringLiteral,NumericLiteral)
 var _PropertySetParameterList=Identifier
 var _Literal=o(NullLiteral,BooleanLiteral,NumericLiteral,StringLiteral,RegularExpressionLiteral)
 var _NullLiteral=NullTok
 var _BooleanLiteral=o(TrueTok,FalseTok)
 var _NumericLiteral=o(q(DecimalLiteral,n(IdentifierStart)),q(HexIntegerLiteral,n(IdentifierStart)))
 var _DecimalLiteral=o(q(DecimalIntegerLiteral,sl_49,r(0,0,DecimalDigit),r(0,1,ExponentPart)),q(sl_49,r(1,0,DecimalDigit),r(0,1,ExponentPart)),q(DecimalIntegerLiteral,r(0,1,ExponentPart)))
 var _DecimalIntegerLiteral=o(sl_52,q(cs_0,r(0,0,DecimalDigit)))
 var _DecimalDigit=cs_1
 var _ExponentPart=q(cs_2,SignedInteger)
 var _SignedInteger=o(r(1,0,DecimalDigit),q(sl_38,r(1,0,DecimalDigit)),q(sl_39,r(1,0,DecimalDigit)))
 var _HexIntegerLiteral=o(q(sl_53,r(1,0,HexDigit)),q(sl_54,r(1,0,HexDigit)))
 var _DQ=cs_3
 var _SQ=cs_4
 var _StringLiteral=o(q(DQ,r(0,0,DoubleStringCharacter),DQ),q(SQ,r(0,0,SingleStringCharacter),SQ))
 var _RS=cs_5
 var _DoubleStringCharacter=o(q(n(o(DQ,RS,LineTerminator)),SourceCharacter),q(RS,EscapeSequence),LineContinuation)
 var _SingleStringCharacter=o(q(n(o(SQ,RS,LineTerminator)),SourceCharacter),q(RS,EscapeSequence),LineContinuation)
 var _LineContinuation=q(RS,LineTerminatorSequence)
 var _EscapeSequence=o(CharacterEscapeSequence,q(sl_52,n(DecimalDigit)),HexEscapeSequence,UnicodeEscapeSequence)
 var _CharacterEscapeSequence=o(SingleEscapeCharacter,NonEscapeCharacter)
 var _SingleEscapeCharacter=cs_6
 var _NonEscapeCharacter=q(n(o(EscapeCharacter,LineTerminator)),SourceCharacter)
 var _EscapeCharacter=o(SingleEscapeCharacter,DecimalDigit,cs_7)
 var _HexEscapeSequence=q(sl_55,HexDigit,HexDigit)
 var _UnicodeEscapeSequence=q(sl_56,r(4,4,HexDigit))
 var _RegularExpressionLiteral=q(sl_41,RegularExpressionBody,sl_41,RegularExpressionFlags)
 var _RegularExpressionBody=q(RegularExpressionFirstChar,r(0,0,RegularExpressionChar))
 var _RegularExpressionFirstChar=o(q(n(o(LineTerminator,cs_8)),SourceCharacter),RegularExpressionBackslashSequence,RegularExpressionClass)
 var _RegularExpressionChar=o(q(n(o(LineTerminator,cs_9)),SourceCharacter),RegularExpressionBackslashSequence,RegularExpressionClass)
 var _RegularExpressionBackslashSequence=q(RS,n(LineTerminator),SourceCharacter)
 var _RegularExpressionClass=q(sl_47,r(0,0,RegularExpressionClassChar),sl_48)
 var _RegularExpressionClassChar=o(q(n(o(LineTerminator,cs_10)),SourceCharacter),RegularExpressionBackslashSequence)
 var _RegularExpressionFlags=r(0,0,IdentifierPart)
 var _SourceCharacter=cs_11
 var _WhiteSpace=cs_12
 var _LF=cs_13
 var _CR=cs_14
 var _LS=cs_15
 var _PS=cs_16
 var _LineTerminator=o(LF,CR,LS,PS)
 var _LineTerminatorSequence=o(LF,q(CR,LF),CR,LS,PS)
 var _Comment=o(MultiLineComment,SingleLineComment)
 var _MultiLineComment=q(sl_57,r(0,0,q(n(sl_58),SourceCharacter)),sl_58)
 var _MultiLineCommentNoLB=q(sl_57,r(0,0,q(n(sl_58),n(LineTerminator),SourceCharacter)),sl_58)
 var _SingleLineComment=q(sl_59,r(0,0,cs_17))
 var _S=r(1,0,o(WhiteSpace,LineTerminatorSequence,Comment))
 var _SnoLB=r(1,0,o(WhiteSpace,SingleLineComment,MultiLineCommentNoLB))
 var _EOS=o(q(r(0,1,S),sl_8),q(r(0,1,SnoLB),LineTerminatorSequence),q(r(0,1,SnoLB),p(sl_3)),q(r(0,1,S),EOF))
 var _EOSnoLB=o(q(r(0,1,SnoLB),sl_8),q(r(0,1,SnoLB),LineTerminatorSequence),q(r(0,1,SnoLB),p(sl_3)),q(r(0,1,SnoLB),EOF))
 var _EOF=n(SourceCharacter)
 var _ReservedWord=q(o(Keyword,FutureReservedWord,sl_60,sl_61,sl_62),n(IdentifierPart))
 var _Keyword=o(sl_63,sl_64,sl_65,sl_66,sl_67,sl_68,sl_69,sl_70,sl_71,sl_72,sl_73,sl_74,sl_75,sl_76,sl_77,sl_78,sl_79,sl_80,sl_81,sl_82,sl_83,sl_84,sl_85,sl_86,sl_87,sl_88)
 var _FutureReservedWord=o(sl_89,sl_90,sl_91,sl_92,sl_93,sl_94,sl_95,sl_96,sl_97,sl_98,sl_99,sl_100,sl_101,sl_102,sl_103,sl_104,sl_105,sl_106,sl_107,sl_108,sl_109,sl_110,sl_111,sl_112,sl_113,sl_114,sl_115,sl_116,sl_117,sl_118)
 var _Identifier=q(n(ReservedWord),IdentifierName)
 var _IdentifierName=q(IdentifierStart,r(0,0,IdentifierPart))
 var _IdentifierStart=o(UnicodeLetter,sl_119,sl_120,q(RS,UnicodeEscapeSequence))
 var _IdentifierPart=o(IdentifierStart,cs_18)
 var _UnicodeLetter=cs_19
 var _HexDigit=cs_20
 var _FalseTok=q(sl_62,n(IdentifierPart))
 var _TrueTok=q(sl_61,n(IdentifierPart))
 var _NullTok=q(sl_60,n(IdentifierPart))
 var _BreakTok=q(sl_63,n(IdentifierPart))
 var _ContinueTok=q(sl_66,n(IdentifierPart))
 var _DebuggerTok=q(sl_67,n(IdentifierPart))
 var _InTok=q(sl_77,n(IdentifierPart))
 var _InstanceOfTok=q(sl_76,n(IdentifierPart))
 var _DeleteTok=q(sl_69,n(IdentifierPart))
 var _FunctionTok=q(sl_74,n(IdentifierPart))
 var _NewTok=q(sl_78,n(IdentifierPart))
 var _ThisTok=q(sl_81,n(IdentifierPart))
 var _TypeofTok=q(sl_84,n(IdentifierPart))
 var _VoidTok=q(sl_86,n(IdentifierPart))
 var _IfTok=q(sl_75,n(IdentifierPart))
 var _ElseTok=q(sl_71,n(IdentifierPart))
 var _DoTok=q(sl_70,n(IdentifierPart))
 var _WhileTok=q(sl_87,n(IdentifierPart))
 var _ForTok=q(sl_73,n(IdentifierPart))
 var _VarTok=q(sl_85,n(IdentifierPart))
 var _ReturnTok=q(sl_79,n(IdentifierPart))
 var _CaseTok=q(sl_64,n(IdentifierPart))
 var _DefaultTok=q(sl_68,n(IdentifierPart))
 var _SwitchTok=q(sl_80,n(IdentifierPart))
 var _ThrowTok=q(sl_82,n(IdentifierPart))
 var _CatchTok=q(sl_65,n(IdentifierPart))
 var _FinallyTok=q(sl_72,n(IdentifierPart))
 var _TryTok=q(sl_83,n(IdentifierPart))
 var _WithTok=q(sl_88,n(IdentifierPart))
 function cs_0(){var c,x;if(pos==l)return false;c=g(pos);x=c<49?0:c<58?1:0;if(x){pos++;return true}return false}
 function cs_1(){var c,x;if(pos==l)return false;c=g(pos);x=c<48?0:c<58?1:0;if(x){pos++;return true}return false}
 function cs_2(){var c,x;if(pos==l)return false;c=g(pos);x=c<70?c<69?0:1:c<101?0:c<102?1:0;if(x){pos++;return true}return false}
 function cs_3(){var c,x;if(pos==l)return false;c=g(pos);x=c<34?0:c<35?1:0;if(x){pos++;return true}return false}
 function cs_4(){var c,x;if(pos==l)return false;c=g(pos);x=c<39?0:c<40?1:0;if(x){pos++;return true}return false}
 function cs_5(){var c,x;if(pos==l)return false;c=g(pos);x=c<92?0:c<93?1:0;if(x){pos++;return true}return false}
 function cs_6(){var c,x;if(pos==l)return false;c=g(pos);x=c<102?c<40?c<35?c<34?0:1:c<39?0:1:c<93?c<92?0:1:c<98?0:c<99?1:0:c<115?c<110?c<103?1:0:c<111?1:c<114?0:1:c<117?c<116?0:1:c<118?0:c<119?1:0;if(x){pos++;return true}return false}
 function cs_7(){var c,x;if(pos==l)return false;c=g(pos);x=c<118?c<117?0:1:c<120?0:c<121?1:0;if(x){pos++;return true}return false}
 function cs_8(){var c,x;if(pos==l)return false;c=g(pos);x=c<47?c<42?0:c<43?1:0:c<91?c<48?1:0:c<93?1:0;if(x){pos++;return true}return false}
 function cs_9(){var c,x;if(pos==l)return false;c=g(pos);x=c<48?c<47?0:1:c<91?0:c<93?1:0;if(x){pos++;return true}return false}
 function cs_10(){var c,x;if(pos==l)return false;c=g(pos);x=c<92?0:c<94?1:0;if(x){pos++;return true}return false}
 function cs_11(){var c,x;if(pos==l)return false;c=g(pos);x=c<0?0:c<1114112?1:0;if(x){pos++;return true}return false}
 function cs_12(){var c,x;if(pos==l)return false;c=g(pos);x=c<5761?c<33?c<11?c<9?0:c<10?1:0:c<13?1:c<32?0:1:c<160?c<133?0:c<134?1:0:c<161?1:c<5760?0:1:c<8240?c<8192?c<6158?0:c<6159?1:0:c<8204?1:c<8239?0:1:c<12288?c<8287?0:c<8288?1:0:c<65279?c<12289?1:0:c<65280?1:0;if(x){pos++;return true}return false}
 function cs_13(){var c,x;if(pos==l)return false;c=g(pos);x=c<10?0:c<11?1:0;if(x){pos++;return true}return false}
 function cs_14(){var c,x;if(pos==l)return false;c=g(pos);x=c<13?0:c<14?1:0;if(x){pos++;return true}return false}
 function cs_15(){var c,x;if(pos==l)return false;c=g(pos);x=c<8232?0:c<8233?1:0;if(x){pos++;return true}return false}
 function cs_16(){var c,x;if(pos==l)return false;c=g(pos);x=c<8233?0:c<8234?1:0;if(x){pos++;return true}return false}
 function cs_17(){var c,x;if(pos==l)return false;c=g(pos);x=c<13?c<10?c<0?0:1:c<11?0:1:c<8232?c<14?0:1:c<8234?0:1;if(x){pos++;return true}return false}
 function cs_18(){var c,x;if(pos==l)return false;c=g(pos);if(c<3031)x=c<2501?c<1769?c<1478?c<1160?c<96?c<58?c<48?0:1:c<95?0:1:c<880?c<768?0:1:c<1155?0:1:c<1472?c<1470?c<1425?0:1:c<1471?0:1:c<1475?c<1473?0:1:c<1476?0:1:c<1642?c<1563?c<1480?c<1479?0:1:c<1552?0:1:c<1631?c<1611?0:1:c<1632?0:1:c<1757?c<1649?c<1648?0:1:c<1750?0:1:c<1765?c<1759?0:1:c<1767?0:1:c<2308?c<1867?c<1786?c<1774?c<1770?0:1:c<1776?0:1:c<1810?c<1809?0:1:c<1840?0:1:c<1994?c<1969?c<1958?0:1:c<1984?0:1:c<2036?c<2027?0:1:c<2305?0:1:c<2404?c<2382?c<2365?c<2364?0:1:c<2366?0:1:c<2389?c<2385?0:1:c<2402?0:1:c<2436?c<2416?c<2406?0:1:c<2433?0:1:c<2493?c<2492?0:1:c<2494?0:1:c<2758?c<2627?c<2532?c<2510?c<2505?c<2503?0:1:c<2507?0:1:c<2520?c<2519?0:1:c<2530?0:1:c<2564?c<2544?c<2534?0:1:c<2561?0:1:c<2621?c<2620?0:1:c<2622?0:1:c<2674?c<2638?c<2633?c<2631?0:1:c<2635?0:1:c<2642?c<2641?0:1:c<2662?0:1:c<2692?c<2678?c<2677?0:1:c<2689?0:1:c<2749?c<2748?0:1:c<2750?0:1:c<2889?c<2800?c<2766?c<2762?c<2759?0:1:c<2763?0:1:c<2788?c<2786?0:1:c<2790?0:1:c<2877?c<2820?c<2817?0:1:c<2876?0:1:c<2885?c<2878?0:1:c<2887?0:1:c<2928?c<2904?c<2894?c<2891?0:1:c<2902?0:1:c<2916?c<2914?0:1:c<2918?0:1:c<3011?c<2947?c<2946?0:1:c<3006?0:1:c<3017?c<3014?0:1:c<3018?0:c<3022?1:0;else if(c<6070)x=c<3643?c<3300?c<3172?c<3141?c<3056?c<3032?c<3031?0:1:c<3046?0:1:c<3076?c<3073?0:1:c<3134?0:1:c<3150?c<3145?c<3142?0:1:c<3146?0:1:c<3159?c<3157?0:1:c<3170?0:1:c<3269?c<3204?c<3184?c<3174?0:1:c<3202?0:1:c<3261?c<3260?0:1:c<3262?0:1:c<3278?c<3273?c<3270?0:1:c<3274?0:1:c<3287?c<3285?0:1:c<3298?0:1:c<3440?c<3401?c<3332?c<3312?c<3302?0:1:c<3330?0:1:c<3397?c<3390?0:1:c<3398?0:1:c<3416?c<3406?c<3402?0:1:c<3415?0:1:c<3428?c<3426?0:1:c<3430?0:1:c<3543?c<3531?c<3460?c<3458?0:1:c<3530?0:1:c<3541?c<3535?0:1:c<3542?0:1:c<3572?c<3552?c<3544?0:1:c<3570?0:1:c<3634?c<3633?0:1:c<3636?0:1:c<3992?c<3866?c<3770?c<3674?c<3663?c<3655?0:1:c<3664?0:1:c<3762?c<3761?0:1:c<3764?0:1:c<3790?c<3773?c<3771?0:1:c<3784?0:1:c<3802?c<3792?0:1:c<3864?0:1:c<3898?c<3894?c<3882?c<3872?0:1:c<3893?0:1:c<3896?c<3895?0:1:c<3897?0:1:c<3973?c<3904?c<3902?0:1:c<3953?0:1:c<3976?c<3974?0:1:c<3984?0:1:c<4206?c<4170?c<4039?c<4029?c<3993?0:1:c<4038?0:1:c<4159?c<4139?0:1:c<4160?0:1:c<4193?c<4186?c<4182?0:1:c<4190?0:1:c<4197?c<4194?0:1:c<4199?0:1:c<4960?c<4238?c<4213?c<4209?0:1:c<4226?0:1:c<4250?c<4239?0:1:c<4959?0:1:c<5941?c<5909?c<5906?0:1:c<5938?0:1:c<5972?c<5970?0:1:c<6002?0:c<6004?1:0
else x=c<42622?c<7043?c<6480?c<6160?c<6110?c<6100?c<6070?0:1:c<6109?0:1:c<6122?c<6112?0:1:c<6155?0:c<6158?1:0:c<6432?c<6313?c<6170?1:0:c<6314?1:0:c<6448?c<6444?1:0:c<6460?1:c<6470?0:1:c<6912?c<6602?c<6593?c<6576?0:1:c<6600?0:1:c<6618?c<6608?0:1:c<6679?0:c<6684?1:0:c<6992?c<6964?c<6917?1:0:c<6981?1:0:c<7019?c<7002?1:0:c<7028?1:c<7040?0:1:c<8277?c<7248?c<7098?c<7083?c<7073?0:1:c<7088?0:1:c<7224?c<7204?0:1:c<7232?0:c<7242?1:0:c<7678?c<7616?c<7258?1:0:c<7655?1:0:c<8255?c<7680?1:0:c<8257?1:c<8276?0:1:c<12330?c<8418?c<8413?c<8400?0:1:c<8417?0:1:c<8433?c<8421?0:1:c<11744?0:c<11776?1:0:c<42528?c<12441?c<12336?1:0:c<12443?1:0:c<42607?c<42538?1:0:c<42608?1:c<42620?0:1:c<65077?c<43310?c<43136?c<43015?c<43011?c<43010?0:1:c<43014?0:1:c<43020?c<43019?0:1:c<43043?0:c<43048?1:0:c<43216?c<43188?c<43138?1:0:c<43205?1:0:c<43264?c<43226?1:0:c<43274?1:c<43302?0:1:c<43600?c<43575?c<43348?c<43335?0:1:c<43561?0:1:c<43588?c<43587?0:1:c<43596?0:c<43598?1:0:c<65024?c<64286?c<43610?1:0:c<64287?1:0:c<65056?c<65040?1:0:c<65063?1:c<65075?0:1:c<68155?c<66720?c<65306?c<65104?c<65101?0:1:c<65296?0:1:c<65344?c<65343?0:1:c<66045?0:c<66046?1:0:c<68101?c<68097?c<66730?1:0:c<68100?1:0:c<68108?c<68103?1:0:c<68112?1:c<68152?0:1:c<119173?c<119146?c<68160?c<68159?0:1:c<119141?0:1:c<119155?c<119149?0:1:c<119163?0:c<119171?1:0:c<119365?c<119210?c<119180?1:0:c<119214?1:c<119362?0:1:c<120832?c<120782?0:1:c<917760?0:c<918000?1:0;if(x){pos++;return true}return false}
 function cs_19(){var c,x;if(pos==l)return false;c=g(pos);if(c<2613)x=c<1767?c<903?c<706?c<182?c<123?c<91?c<65?0:1:c<97?0:1:c<171?c<170?0:1:c<181?0:1:c<215?c<187?c<186?0:1:c<192?0:1:c<247?c<216?0:1:c<248?0:1:c<751?c<741?c<722?c<710?0:1:c<736?0:1:c<749?c<748?0:1:c<750?0:1:c<888?c<885?c<880?0:1:c<886?0:1:c<894?c<890?0:1:c<902?0:1:c<1370?c<1014?c<909?c<907?c<904?0:1:c<908?0:1:c<930?c<910?0:1:c<931?0:1:c<1316?c<1154?c<1015?0:1:c<1162?0:1:c<1367?c<1329?0:1:c<1369?0:1:c<1611?c<1515?c<1416?c<1377?0:1:c<1488?0:1:c<1523?c<1520?0:1:c<1569?0:1:c<1748?c<1648?c<1646?0:1:c<1649?0:1:c<1750?c<1749?0:1:c<1765?0:1:c<2432?c<2027?c<1809?c<1789?c<1776?c<1774?0:1:c<1786?0:1:c<1792?c<1791?0:1:c<1808?0:1:c<1958?c<1840?c<1810?0:1:c<1869?0:1:c<1970?c<1969?0:1:c<1994?0:1:c<2366?c<2043?c<2038?c<2036?0:1:c<2042?0:1:c<2362?c<2308?0:1:c<2365?0:1:c<2402?c<2385?c<2384?0:1:c<2392?0:1:c<2419?c<2417?0:1:c<2427?0:1:c<2511?c<2481?c<2449?c<2445?c<2437?0:1:c<2447?0:1:c<2473?c<2451?0:1:c<2474?0:1:c<2490?c<2483?c<2482?0:1:c<2486?0:1:c<2494?c<2493?0:1:c<2510?0:1:c<2571?c<2530?c<2526?c<2524?0:1:c<2527?0:1:c<2546?c<2544?0:1:c<2565?0:1:c<2601?c<2577?c<2575?0:1:c<2579?0:1:c<2609?c<2602?0:1:c<2610?0:c<2612?1:0;else if(c<3634)x=c<2981?c<2833?c<2729?c<2655?c<2618?c<2615?c<2613?0:1:c<2616?0:1:c<2653?c<2649?0:1:c<2654?0:1:c<2702?c<2677?c<2674?0:1:c<2693?0:1:c<2706?c<2703?0:1:c<2707?0:1:c<2750?c<2740?c<2737?c<2730?0:1:c<2738?0:1:c<2746?c<2741?0:1:c<2749?0:1:c<2786?c<2769?c<2768?0:1:c<2784?0:1:c<2829?c<2821?0:1:c<2831?0:1:c<2930?c<2874?c<2865?c<2857?c<2835?0:1:c<2858?0:1:c<2868?c<2866?0:1:c<2869?0:1:c<2910?c<2878?c<2877?0:1:c<2908?0:1:c<2914?c<2911?0:1:c<2929?0:1:c<2966?c<2955?c<2948?c<2947?0:1:c<2949?0:1:c<2961?c<2958?0:1:c<2962?0:1:c<2973?c<2971?c<2969?0:1:c<2972?0:1:c<2976?c<2974?0:1:c<2979?0:1:c<3258?c<3130?c<3085?c<3002?c<2987?c<2984?0:1:c<2990?0:1:c<3025?c<3024?0:1:c<3077?0:1:c<3113?c<3089?c<3086?0:1:c<3090?0:1:c<3124?c<3114?0:1:c<3125?0:1:c<3213?c<3162?c<3134?c<3133?0:1:c<3160?0:1:c<3170?c<3168?0:1:c<3205?0:1:c<3241?c<3217?c<3214?0:1:c<3218?0:1:c<3252?c<3242?0:1:c<3253?0:1:c<3390?c<3341?c<3295?c<3262?c<3261?0:1:c<3294?0:1:c<3298?c<3296?0:1:c<3333?0:1:c<3369?c<3345?c<3342?0:1:c<3346?0:1:c<3386?c<3370?0:1:c<3389?0:1:c<3506?c<3456?c<3426?c<3424?0:1:c<3450?0:1:c<3479?c<3461?0:1:c<3482?0:1:c<3518?c<3516?c<3507?0:1:c<3517?0:1:c<3527?c<3520?0:1:c<3585?0:c<3633?1:0
else if(c<5952)x=c<4239?c<3774?c<3736?c<3717?c<3655?c<3636?c<3634?0:1:c<3648?0:1:c<3715?c<3713?0:1:c<3716?0:1:c<3723?c<3721?c<3719?0:1:c<3722?0:1:c<3726?c<3725?0:1:c<3732?0:1:c<3752?c<3748?c<3744?c<3737?0:1:c<3745?0:1:c<3750?c<3749?0:1:c<3751?0:1:c<3761?c<3756?c<3754?0:1:c<3757?0:1:c<3764?c<3762?0:1:c<3773?0:1:c<4139?c<3841?c<3783?c<3781?c<3776?0:1:c<3782?0:1:c<3806?c<3804?0:1:c<3840?0:1:c<3949?c<3912?c<3904?0:1:c<3913?0:1:c<3980?c<3976?0:1:c<4096?0:1:c<4194?c<4182?c<4160?c<4159?0:1:c<4176?0:1:c<4190?c<4186?0:1:c<4193?0:1:c<4209?c<4199?c<4197?0:1:c<4206?0:1:c<4226?c<4213?0:1:c<4238?0:1:c<4799?c<4686?c<4442?c<4347?c<4294?c<4256?0:1:c<4304?0:1:c<4349?c<4348?0:1:c<4352?0:1:c<4602?c<4515?c<4447?0:1:c<4520?0:1:c<4681?c<4608?0:1:c<4682?0:1:c<4745?c<4697?c<4695?c<4688?0:1:c<4696?0:1:c<4702?c<4698?0:1:c<4704?0:1:c<4785?c<4750?c<4746?0:1:c<4752?0:1:c<4790?c<4786?0:1:c<4792?0:1:c<5109?c<4881?c<4806?c<4801?c<4800?0:1:c<4802?0:1:c<4823?c<4808?0:1:c<4824?0:1:c<4955?c<4886?c<4882?0:1:c<4888?0:1:c<5008?c<4992?0:1:c<5024?0:1:c<5867?c<5751?c<5741?c<5121?0:1:c<5743?0:1:c<5787?c<5761?0:1:c<5792?0:1:c<5901?c<5873?c<5870?0:1:c<5888?0:1:c<5906?c<5902?0:1:c<5920?0:c<5938?1:0
else if(c<11520)x=c<8062?c<6964?c<6313?c<6068?c<5997?c<5970?c<5952?0:1:c<5984?0:1:c<6001?c<5998?0:1:c<6016?0:1:c<6109?c<6104?c<6103?0:1:c<6108?0:1:c<6264?c<6176?0:1:c<6272?0:1:c<6517?c<6429?c<6315?c<6314?0:1:c<6400?0:1:c<6510?c<6480?0:1:c<6512?0:1:c<6600?c<6570?c<6528?0:1:c<6593?0:1:c<6679?c<6656?0:1:c<6917?0:1:c<7958?c<7204?c<7073?c<6988?c<6981?0:1:c<7043?0:1:c<7088?c<7086?0:1:c<7168?0:1:c<7294?c<7248?c<7245?0:1:c<7258?0:1:c<7616?c<7424?0:1:c<7680?0:1:c<8024?c<8006?c<7966?c<7960?0:1:c<7968?0:1:c<8014?c<8008?0:1:c<8016?0:1:c<8028?c<8026?c<8025?0:1:c<8027?0:1:c<8030?c<8029?0:1:c<8031?0:1:c<8468?c<8173?c<8133?c<8125?c<8117?c<8064?0:1:c<8118?0:1:c<8127?c<8126?0:1:c<8130?0:1:c<8148?c<8141?c<8134?0:1:c<8144?0:1:c<8156?c<8150?0:1:c<8160?0:1:c<8320?c<8189?c<8181?c<8178?0:1:c<8182?0:1:c<8306?c<8305?0:1:c<8319?0:1:c<8451?c<8341?c<8336?0:1:c<8450?0:1:c<8456?c<8455?0:1:c<8458?0:1:c<8512?c<8487?c<8478?c<8470?c<8469?0:1:c<8473?0:1:c<8485?c<8484?0:1:c<8486?0:1:c<8494?c<8489?c<8488?0:1:c<8490?0:1:c<8506?c<8495?0:1:c<8508?0:1:c<11311?c<8527?c<8522?c<8517?0:1:c<8526?0:1:c<8585?c<8544?0:1:c<11264?0:1:c<11376?c<11359?c<11312?0:1:c<11360?0:1:c<11390?c<11377?0:1:c<11392?0:c<11493?1:0
else if(c<64914)x=c<42592?c<12342?c<11711?c<11671?c<11622?c<11558?c<11520?0:1:c<11568?0:1:c<11632?c<11631?0:1:c<11648?0:1:c<11695?c<11687?c<11680?0:1:c<11688?0:1:c<11703?c<11696?0:1:c<11704?0:1:c<11743?c<11727?c<11719?c<11712?0:1:c<11720?0:1:c<11735?c<11728?0:1:c<11736?0:1:c<12296?c<11824?c<11823?0:1:c<12293?0:1:c<12330?c<12321?0:1:c<12337?0:1:c<12728?c<12539?c<12439?c<12349?c<12344?0:1:c<12353?0:1:c<12448?c<12445?0:1:c<12449?0:1:c<12590?c<12544?c<12540?0:1:c<12549?0:1:c<12687?c<12593?0:1:c<12704?0:1:c<42125?c<19894?c<12800?c<12784?0:1:c<13312?0:1:c<40900?c<19968?0:1:c<40960?0:1:c<42528?c<42509?c<42240?0:1:c<42512?0:1:c<42540?c<42538?0:1:c<42560?0:1:c<43596?c<43019?c<42889?c<42648?c<42607?c<42594?0:1:c<42623?0:1:c<42784?c<42775?0:1:c<42786?0:1:c<43010?c<42893?c<42891?0:1:c<43003?0:1:c<43014?c<43011?0:1:c<43015?0:1:c<43302?c<43124?c<43043?c<43020?0:1:c<43072?0:1:c<43188?c<43138?0:1:c<43274?0:1:c<43561?c<43335?c<43312?0:1:c<43520?0:1:c<43587?c<43584?0:1:c<43588?0:1:c<64297?c<64218?c<64046?c<55204?c<44032?0:1:c<63744?0:1:c<64107?c<64048?0:1:c<64112?0:1:c<64280?c<64263?c<64256?0:1:c<64275?0:1:c<64286?c<64285?0:1:c<64287?0:1:c<64322?c<64317?c<64311?c<64298?0:1:c<64312?0:1:c<64319?c<64318?0:1:c<64320?0:1:c<64434?c<64325?c<64323?0:1:c<64326?0:1:c<64830?c<64467?0:1:c<64848?0:c<64912?1:0
else x=c<68097?c<65856?c<65488?c<65313?c<65020?c<64968?c<64914?0:1:c<65008?0:1:c<65141?c<65136?0:1:c<65142?0:c<65277?1:0:c<65382?c<65345?c<65339?1:0:c<65371?1:0:c<65474?c<65471?1:0:c<65480?1:c<65482?0:1:c<65576?c<65501?c<65496?c<65490?0:1:c<65498?0:1:c<65548?c<65536?0:1:c<65549?0:c<65575?1:0:c<65614?c<65596?c<65595?1:0:c<65598?1:c<65599?0:1:c<65630?c<65616?0:1:c<65664?0:c<65787?1:0:c<66560?c<66379?c<66208?c<66176?c<65909?1:0:c<66205?1:0:c<66304?c<66257?1:0:c<66335?1:c<66352?0:1:c<66500?c<66462?c<66432?0:1:c<66464?0:1:c<66512?c<66504?0:1:c<66513?0:c<66518?1:0:c<67641?c<67592?c<67584?c<66718?1:0:c<67590?1:0:c<67594?c<67593?1:0:c<67638?1:c<67639?0:1:c<67840?c<67645?c<67644?0:1:c<67647?0:c<67648?1:0:c<67872?c<67862?1:0:c<67898?1:c<68096?0:1:c<120094?c<119971?c<74752?c<68120?c<68116?c<68112?0:1:c<68117?0:1:c<68148?c<68121?0:1:c<73728?0:c<74607?1:0:c<119894?c<119808?c<74851?1:0:c<119893?1:0:c<119966?c<119965?1:0:c<119968?1:c<119970?0:1:c<119997?c<119981?c<119975?c<119973?0:1:c<119977?0:1:c<119994?c<119982?0:1:c<119995?0:c<119996?1:0:c<120075?c<120005?c<120004?1:0:c<120070?1:c<120071?0:1:c<120085?c<120077?0:1:c<120086?0:c<120093?1:0:c<120597?c<120145?c<120128?c<120123?c<120122?1:0:c<120127?1:0:c<120134?c<120133?1:0:c<120135?1:c<120138?0:1:c<120514?c<120486?c<120146?0:1:c<120488?0:c<120513?1:0:c<120540?c<120539?1:0:c<120571?1:c<120572?0:1:c<120714?c<120655?c<120629?c<120598?0:1:c<120630?0:1:c<120687?c<120656?0:1:c<120688?0:c<120713?1:0:c<120780?c<120746?c<120745?1:0:c<120771?1:c<120772?0:1:c<173783?c<131072?0:1:c<194560?0:c<195102?1:0;if(x){pos++;return true}return false}
 function cs_20(){var c,x;if(pos==l)return false;c=g(pos);x=c<65?c<48?0:c<58?1:0:c<97?c<71?1:0:c<103?1:0;if(x){pos++;return true}return false}
 function sl_0(){var p=pos;if(str.charCodeAt(p)==40){pos+=1;return true}return false}
 function sl_1(){var p=pos;if(str.charCodeAt(p)==41){pos+=1;return true}return false}
 function sl_2(){var p=pos;if(str.charCodeAt(p)==123){pos+=1;return true}return false}
 function sl_3(){var p=pos;if(str.charCodeAt(p)==125){pos+=1;return true}return false}
 function sl_4(){var p=pos;if(str.charCodeAt(p)==44){pos+=1;return true}return false}
 function sl_5(){var p=pos;if(str.charCodeAt(p++)==117&&str.charCodeAt(p++)==115&&str.charCodeAt(p)==101){pos+=3;return true}return false}
 function sl_6(){var p=pos;if(str.charCodeAt(p++)==115&&str.charCodeAt(p++)==116&&str.charCodeAt(p++)==114&&str.charCodeAt(p++)==105&&str.charCodeAt(p++)==99&&str.charCodeAt(p)==116){pos+=6;return true}return false}
 function sl_7(){var p=pos;if(str.charCodeAt(p)==61){pos+=1;return true}return false}
 function sl_8(){var p=pos;if(str.charCodeAt(p)==59){pos+=1;return true}return false}
 function sl_9(){var p=pos;if(str.charCodeAt(p)==58){pos+=1;return true}return false}
 function sl_10(){var p=pos;if(str.charCodeAt(p++)==42&&str.charCodeAt(p)==61){pos+=2;return true}return false}
 function sl_11(){var p=pos;if(str.charCodeAt(p++)==47&&str.charCodeAt(p)==61){pos+=2;return true}return false}
 function sl_12(){var p=pos;if(str.charCodeAt(p++)==37&&str.charCodeAt(p)==61){pos+=2;return true}return false}
 function sl_13(){var p=pos;if(str.charCodeAt(p++)==43&&str.charCodeAt(p)==61){pos+=2;return true}return false}
 function sl_14(){var p=pos;if(str.charCodeAt(p++)==45&&str.charCodeAt(p)==61){pos+=2;return true}return false}
 function sl_15(){var p=pos;if(str.charCodeAt(p++)==60&&str.charCodeAt(p++)==60&&str.charCodeAt(p)==61){pos+=3;return true}return false}
 function sl_16(){var p=pos;if(str.charCodeAt(p++)==62&&str.charCodeAt(p++)==62&&str.charCodeAt(p)==61){pos+=3;return true}return false}
 function sl_17(){var p=pos;if(str.charCodeAt(p++)==62&&str.charCodeAt(p++)==62&&str.charCodeAt(p++)==62&&str.charCodeAt(p)==61){pos+=4;return true}return false}
 function sl_18(){var p=pos;if(str.charCodeAt(p++)==38&&str.charCodeAt(p)==61){pos+=2;return true}return false}
 function sl_19(){var p=pos;if(str.charCodeAt(p++)==94&&str.charCodeAt(p)==61){pos+=2;return true}return false}
 function sl_20(){var p=pos;if(str.charCodeAt(p++)==124&&str.charCodeAt(p)==61){pos+=2;return true}return false}
 function sl_21(){var p=pos;if(str.charCodeAt(p)==63){pos+=1;return true}return false}
 function sl_22(){var p=pos;if(str.charCodeAt(p++)==124&&str.charCodeAt(p)==124){pos+=2;return true}return false}
 function sl_23(){var p=pos;if(str.charCodeAt(p++)==38&&str.charCodeAt(p)==38){pos+=2;return true}return false}
 function sl_24(){var p=pos;if(str.charCodeAt(p)==124){pos+=1;return true}return false}
 function sl_25(){var p=pos;if(str.charCodeAt(p)==94){pos+=1;return true}return false}
 function sl_26(){var p=pos;if(str.charCodeAt(p)==38){pos+=1;return true}return false}
 function sl_27(){var p=pos;if(str.charCodeAt(p++)==61&&str.charCodeAt(p++)==61&&str.charCodeAt(p)==61){pos+=3;return true}return false}
 function sl_28(){var p=pos;if(str.charCodeAt(p++)==33&&str.charCodeAt(p++)==61&&str.charCodeAt(p)==61){pos+=3;return true}return false}
 function sl_29(){var p=pos;if(str.charCodeAt(p++)==61&&str.charCodeAt(p)==61){pos+=2;return true}return false}
 function sl_30(){var p=pos;if(str.charCodeAt(p++)==33&&str.charCodeAt(p)==61){pos+=2;return true}return false}
 function sl_31(){var p=pos;if(str.charCodeAt(p++)==60&&str.charCodeAt(p)==61){pos+=2;return true}return false}
 function sl_32(){var p=pos;if(str.charCodeAt(p++)==62&&str.charCodeAt(p)==61){pos+=2;return true}return false}
 function sl_33(){var p=pos;if(str.charCodeAt(p)==60){pos+=1;return true}return false}
 function sl_34(){var p=pos;if(str.charCodeAt(p)==62){pos+=1;return true}return false}
 function sl_35(){var p=pos;if(str.charCodeAt(p++)==60&&str.charCodeAt(p)==60){pos+=2;return true}return false}
 function sl_36(){var p=pos;if(str.charCodeAt(p++)==62&&str.charCodeAt(p++)==62&&str.charCodeAt(p)==62){pos+=3;return true}return false}
 function sl_37(){var p=pos;if(str.charCodeAt(p++)==62&&str.charCodeAt(p)==62){pos+=2;return true}return false}
 function sl_38(){var p=pos;if(str.charCodeAt(p)==43){pos+=1;return true}return false}
 function sl_39(){var p=pos;if(str.charCodeAt(p)==45){pos+=1;return true}return false}
 function sl_40(){var p=pos;if(str.charCodeAt(p)==42){pos+=1;return true}return false}
 function sl_41(){var p=pos;if(str.charCodeAt(p)==47){pos+=1;return true}return false}
 function sl_42(){var p=pos;if(str.charCodeAt(p)==37){pos+=1;return true}return false}
 function sl_43(){var p=pos;if(str.charCodeAt(p++)==43&&str.charCodeAt(p)==43){pos+=2;return true}return false}
 function sl_44(){var p=pos;if(str.charCodeAt(p++)==45&&str.charCodeAt(p)==45){pos+=2;return true}return false}
 function sl_45(){var p=pos;if(str.charCodeAt(p)==126){pos+=1;return true}return false}
 function sl_46(){var p=pos;if(str.charCodeAt(p)==33){pos+=1;return true}return false}
 function sl_47(){var p=pos;if(str.charCodeAt(p)==91){pos+=1;return true}return false}
 function sl_48(){var p=pos;if(str.charCodeAt(p)==93){pos+=1;return true}return false}
 function sl_49(){var p=pos;if(str.charCodeAt(p)==46){pos+=1;return true}return false}
 function sl_50(){var p=pos;if(str.charCodeAt(p++)==103&&str.charCodeAt(p++)==101&&str.charCodeAt(p)==116){pos+=3;return true}return false}
 function sl_51(){var p=pos;if(str.charCodeAt(p++)==115&&str.charCodeAt(p++)==101&&str.charCodeAt(p)==116){pos+=3;return true}return false}
 function sl_52(){var p=pos;if(str.charCodeAt(p)==48){pos+=1;return true}return false}
 function sl_53(){var p=pos;if(str.charCodeAt(p++)==48&&str.charCodeAt(p)==120){pos+=2;return true}return false}
 function sl_54(){var p=pos;if(str.charCodeAt(p++)==48&&str.charCodeAt(p)==88){pos+=2;return true}return false}
 function sl_55(){var p=pos;if(str.charCodeAt(p)==120){pos+=1;return true}return false}
 function sl_56(){var p=pos;if(str.charCodeAt(p)==117){pos+=1;return true}return false}
 function sl_57(){var p=pos;if(str.charCodeAt(p++)==47&&str.charCodeAt(p)==42){pos+=2;return true}return false}
 function sl_58(){var p=pos;if(str.charCodeAt(p++)==42&&str.charCodeAt(p)==47){pos+=2;return true}return false}
 function sl_59(){var p=pos;if(str.charCodeAt(p++)==47&&str.charCodeAt(p)==47){pos+=2;return true}return false}
 function sl_60(){var p=pos;if(str.charCodeAt(p++)==110&&str.charCodeAt(p++)==117&&str.charCodeAt(p++)==108&&str.charCodeAt(p)==108){pos+=4;return true}return false}
 function sl_61(){var p=pos;if(str.charCodeAt(p++)==116&&str.charCodeAt(p++)==114&&str.charCodeAt(p++)==117&&str.charCodeAt(p)==101){pos+=4;return true}return false}
 function sl_62(){var p=pos;if(str.charCodeAt(p++)==102&&str.charCodeAt(p++)==97&&str.charCodeAt(p++)==108&&str.charCodeAt(p++)==115&&str.charCodeAt(p)==101){pos+=5;return true}return false}
 function sl_63(){var p=pos;if(str.charCodeAt(p++)==98&&str.charCodeAt(p++)==114&&str.charCodeAt(p++)==101&&str.charCodeAt(p++)==97&&str.charCodeAt(p)==107){pos+=5;return true}return false}
 function sl_64(){var p=pos;if(str.charCodeAt(p++)==99&&str.charCodeAt(p++)==97&&str.charCodeAt(p++)==115&&str.charCodeAt(p)==101){pos+=4;return true}return false}
 function sl_65(){var p=pos;if(str.charCodeAt(p++)==99&&str.charCodeAt(p++)==97&&str.charCodeAt(p++)==116&&str.charCodeAt(p++)==99&&str.charCodeAt(p)==104){pos+=5;return true}return false}
 function sl_66(){var p=pos;if(str.charCodeAt(p++)==99&&str.charCodeAt(p++)==111&&str.charCodeAt(p++)==110&&str.charCodeAt(p++)==116&&str.charCodeAt(p++)==105&&str.charCodeAt(p++)==110&&str.charCodeAt(p++)==117&&str.charCodeAt(p)==101){pos+=8;return true}return false}
 function sl_67(){var p=pos;if(str.charCodeAt(p++)==100&&str.charCodeAt(p++)==101&&str.charCodeAt(p++)==98&&str.charCodeAt(p++)==117&&str.charCodeAt(p++)==103&&str.charCodeAt(p++)==103&&str.charCodeAt(p++)==101&&str.charCodeAt(p)==114){pos+=8;return true}return false}
 function sl_68(){var p=pos;if(str.charCodeAt(p++)==100&&str.charCodeAt(p++)==101&&str.charCodeAt(p++)==102&&str.charCodeAt(p++)==97&&str.charCodeAt(p++)==117&&str.charCodeAt(p++)==108&&str.charCodeAt(p)==116){pos+=7;return true}return false}
 function sl_69(){var p=pos;if(str.charCodeAt(p++)==100&&str.charCodeAt(p++)==101&&str.charCodeAt(p++)==108&&str.charCodeAt(p++)==101&&str.charCodeAt(p++)==116&&str.charCodeAt(p)==101){pos+=6;return true}return false}
 function sl_70(){var p=pos;if(str.charCodeAt(p++)==100&&str.charCodeAt(p)==111){pos+=2;return true}return false}
 function sl_71(){var p=pos;if(str.charCodeAt(p++)==101&&str.charCodeAt(p++)==108&&str.charCodeAt(p++)==115&&str.charCodeAt(p)==101){pos+=4;return true}return false}
 function sl_72(){var p=pos;if(str.charCodeAt(p++)==102&&str.charCodeAt(p++)==105&&str.charCodeAt(p++)==110&&str.charCodeAt(p++)==97&&str.charCodeAt(p++)==108&&str.charCodeAt(p++)==108&&str.charCodeAt(p)==121){pos+=7;return true}return false}
 function sl_73(){var p=pos;if(str.charCodeAt(p++)==102&&str.charCodeAt(p++)==111&&str.charCodeAt(p)==114){pos+=3;return true}return false}
 function sl_74(){var p=pos;if(str.charCodeAt(p++)==102&&str.charCodeAt(p++)==117&&str.charCodeAt(p++)==110&&str.charCodeAt(p++)==99&&str.charCodeAt(p++)==116&&str.charCodeAt(p++)==105&&str.charCodeAt(p++)==111&&str.charCodeAt(p)==110){pos+=8;return true}return false}
 function sl_75(){var p=pos;if(str.charCodeAt(p++)==105&&str.charCodeAt(p)==102){pos+=2;return true}return false}
 function sl_76(){var x=str.slice(pos,pos+10);if(x=="instanceof"){pos+=10;return true}return false}
 function sl_77(){var p=pos;if(str.charCodeAt(p++)==105&&str.charCodeAt(p)==110){pos+=2;return true}return false}
 function sl_78(){var p=pos;if(str.charCodeAt(p++)==110&&str.charCodeAt(p++)==101&&str.charCodeAt(p)==119){pos+=3;return true}return false}
 function sl_79(){var p=pos;if(str.charCodeAt(p++)==114&&str.charCodeAt(p++)==101&&str.charCodeAt(p++)==116&&str.charCodeAt(p++)==117&&str.charCodeAt(p++)==114&&str.charCodeAt(p)==110){pos+=6;return true}return false}
 function sl_80(){var p=pos;if(str.charCodeAt(p++)==115&&str.charCodeAt(p++)==119&&str.charCodeAt(p++)==105&&str.charCodeAt(p++)==116&&str.charCodeAt(p++)==99&&str.charCodeAt(p)==104){pos+=6;return true}return false}
 function sl_81(){var p=pos;if(str.charCodeAt(p++)==116&&str.charCodeAt(p++)==104&&str.charCodeAt(p++)==105&&str.charCodeAt(p)==115){pos+=4;return true}return false}
 function sl_82(){var p=pos;if(str.charCodeAt(p++)==116&&str.charCodeAt(p++)==104&&str.charCodeAt(p++)==114&&str.charCodeAt(p++)==111&&str.charCodeAt(p)==119){pos+=5;return true}return false}
 function sl_83(){var p=pos;if(str.charCodeAt(p++)==116&&str.charCodeAt(p++)==114&&str.charCodeAt(p)==121){pos+=3;return true}return false}
 function sl_84(){var p=pos;if(str.charCodeAt(p++)==116&&str.charCodeAt(p++)==121&&str.charCodeAt(p++)==112&&str.charCodeAt(p++)==101&&str.charCodeAt(p++)==111&&str.charCodeAt(p)==102){pos+=6;return true}return false}
 function sl_85(){var p=pos;if(str.charCodeAt(p++)==118&&str.charCodeAt(p++)==97&&str.charCodeAt(p)==114){pos+=3;return true}return false}
 function sl_86(){var p=pos;if(str.charCodeAt(p++)==118&&str.charCodeAt(p++)==111&&str.charCodeAt(p++)==105&&str.charCodeAt(p)==100){pos+=4;return true}return false}
 function sl_87(){var p=pos;if(str.charCodeAt(p++)==119&&str.charCodeAt(p++)==104&&str.charCodeAt(p++)==105&&str.charCodeAt(p++)==108&&str.charCodeAt(p)==101){pos+=5;return true}return false}
 function sl_88(){var p=pos;if(str.charCodeAt(p++)==119&&str.charCodeAt(p++)==105&&str.charCodeAt(p++)==116&&str.charCodeAt(p)==104){pos+=4;return true}return false}
 function sl_89(){var p=pos;if(str.charCodeAt(p++)==97&&str.charCodeAt(p++)==98&&str.charCodeAt(p++)==115&&str.charCodeAt(p++)==116&&str.charCodeAt(p++)==114&&str.charCodeAt(p++)==97&&str.charCodeAt(p++)==99&&str.charCodeAt(p)==116){pos+=8;return true}return false}
 function sl_90(){var p=pos;if(str.charCodeAt(p++)==98&&str.charCodeAt(p++)==111&&str.charCodeAt(p++)==111&&str.charCodeAt(p++)==108&&str.charCodeAt(p++)==101&&str.charCodeAt(p++)==97&&str.charCodeAt(p)==110){pos+=7;return true}return false}
 function sl_91(){var p=pos;if(str.charCodeAt(p++)==98&&str.charCodeAt(p++)==121&&str.charCodeAt(p++)==116&&str.charCodeAt(p)==101){pos+=4;return true}return false}
 function sl_92(){var p=pos;if(str.charCodeAt(p++)==99&&str.charCodeAt(p++)==104&&str.charCodeAt(p++)==97&&str.charCodeAt(p)==114){pos+=4;return true}return false}
 function sl_93(){var p=pos;if(str.charCodeAt(p++)==99&&str.charCodeAt(p++)==108&&str.charCodeAt(p++)==97&&str.charCodeAt(p++)==115&&str.charCodeAt(p)==115){pos+=5;return true}return false}
 function sl_94(){var p=pos;if(str.charCodeAt(p++)==99&&str.charCodeAt(p++)==111&&str.charCodeAt(p++)==110&&str.charCodeAt(p++)==115&&str.charCodeAt(p)==116){pos+=5;return true}return false}
 function sl_95(){var p=pos;if(str.charCodeAt(p++)==100&&str.charCodeAt(p++)==111&&str.charCodeAt(p++)==117&&str.charCodeAt(p++)==98&&str.charCodeAt(p++)==108&&str.charCodeAt(p)==101){pos+=6;return true}return false}
 function sl_96(){var p=pos;if(str.charCodeAt(p++)==101&&str.charCodeAt(p++)==110&&str.charCodeAt(p++)==117&&str.charCodeAt(p)==109){pos+=4;return true}return false}
 function sl_97(){var p=pos;if(str.charCodeAt(p++)==101&&str.charCodeAt(p++)==120&&str.charCodeAt(p++)==112&&str.charCodeAt(p++)==111&&str.charCodeAt(p++)==114&&str.charCodeAt(p)==116){pos+=6;return true}return false}
 function sl_98(){var p=pos;if(str.charCodeAt(p++)==101&&str.charCodeAt(p++)==120&&str.charCodeAt(p++)==116&&str.charCodeAt(p++)==101&&str.charCodeAt(p++)==110&&str.charCodeAt(p++)==100&&str.charCodeAt(p)==115){pos+=7;return true}return false}
 function sl_99(){var p=pos;if(str.charCodeAt(p++)==102&&str.charCodeAt(p++)==105&&str.charCodeAt(p++)==110&&str.charCodeAt(p++)==97&&str.charCodeAt(p)==108){pos+=5;return true}return false}
 function sl_100(){var p=pos;if(str.charCodeAt(p++)==102&&str.charCodeAt(p++)==108&&str.charCodeAt(p++)==111&&str.charCodeAt(p++)==97&&str.charCodeAt(p)==116){pos+=5;return true}return false}
 function sl_101(){var p=pos;if(str.charCodeAt(p++)==103&&str.charCodeAt(p++)==111&&str.charCodeAt(p++)==116&&str.charCodeAt(p)==111){pos+=4;return true}return false}
 function sl_102(){var x=str.slice(pos,pos+10);if(x=="implements"){pos+=10;return true}return false}
 function sl_103(){var p=pos;if(str.charCodeAt(p++)==105&&str.charCodeAt(p++)==109&&str.charCodeAt(p++)==112&&str.charCodeAt(p++)==111&&str.charCodeAt(p++)==114&&str.charCodeAt(p)==116){pos+=6;return true}return false}
 function sl_104(){var x=str.slice(pos,pos+9);if(x=="interface"){pos+=9;return true}return false}
 function sl_105(){var p=pos;if(str.charCodeAt(p++)==105&&str.charCodeAt(p++)==110&&str.charCodeAt(p)==116){pos+=3;return true}return false}
 function sl_106(){var p=pos;if(str.charCodeAt(p++)==108&&str.charCodeAt(p++)==111&&str.charCodeAt(p++)==110&&str.charCodeAt(p)==103){pos+=4;return true}return false}
 function sl_107(){var p=pos;if(str.charCodeAt(p++)==110&&str.charCodeAt(p++)==97&&str.charCodeAt(p++)==116&&str.charCodeAt(p++)==105&&str.charCodeAt(p++)==118&&str.charCodeAt(p)==101){pos+=6;return true}return false}
 function sl_108(){var p=pos;if(str.charCodeAt(p++)==112&&str.charCodeAt(p++)==97&&str.charCodeAt(p++)==99&&str.charCodeAt(p++)==107&&str.charCodeAt(p++)==97&&str.charCodeAt(p++)==103&&str.charCodeAt(p)==101){pos+=7;return true}return false}
 function sl_109(){var p=pos;if(str.charCodeAt(p++)==112&&str.charCodeAt(p++)==114&&str.charCodeAt(p++)==105&&str.charCodeAt(p++)==118&&str.charCodeAt(p++)==97&&str.charCodeAt(p++)==116&&str.charCodeAt(p)==101){pos+=7;return true}return false}
 function sl_110(){var x=str.slice(pos,pos+9);if(x=="protected"){pos+=9;return true}return false}
 function sl_111(){var p=pos;if(str.charCodeAt(p++)==112&&str.charCodeAt(p++)==117&&str.charCodeAt(p++)==98&&str.charCodeAt(p++)==108&&str.charCodeAt(p++)==105&&str.charCodeAt(p)==99){pos+=6;return true}return false}
 function sl_112(){var p=pos;if(str.charCodeAt(p++)==115&&str.charCodeAt(p++)==104&&str.charCodeAt(p++)==111&&str.charCodeAt(p++)==114&&str.charCodeAt(p)==116){pos+=5;return true}return false}
 function sl_113(){var p=pos;if(str.charCodeAt(p++)==115&&str.charCodeAt(p++)==116&&str.charCodeAt(p++)==97&&str.charCodeAt(p++)==116&&str.charCodeAt(p++)==105&&str.charCodeAt(p)==99){pos+=6;return true}return false}
 function sl_114(){var p=pos;if(str.charCodeAt(p++)==115&&str.charCodeAt(p++)==117&&str.charCodeAt(p++)==112&&str.charCodeAt(p++)==101&&str.charCodeAt(p)==114){pos+=5;return true}return false}
 function sl_115(){var x=str.slice(pos,pos+12);if(x=="synchronized"){pos+=12;return true}return false}
 function sl_116(){var p=pos;if(str.charCodeAt(p++)==116&&str.charCodeAt(p++)==104&&str.charCodeAt(p++)==114&&str.charCodeAt(p++)==111&&str.charCodeAt(p++)==119&&str.charCodeAt(p)==115){pos+=6;return true}return false}
 function sl_117(){var x=str.slice(pos,pos+9);if(x=="transient"){pos+=9;return true}return false}
 function sl_118(){var p=pos;if(str.charCodeAt(p++)==118&&str.charCodeAt(p++)==111&&str.charCodeAt(p++)==108&&str.charCodeAt(p++)==97&&str.charCodeAt(p++)==116&&str.charCodeAt(p++)==105&&str.charCodeAt(p++)==108&&str.charCodeAt(p)==101){pos+=8;return true}return false}
 function sl_119(){var p=pos;if(str.charCodeAt(p)==36){pos+=1;return true}return false}
 function sl_120(){var p=pos;if(str.charCodeAt(p)==95){pos+=1;return true}return false}
 function fin(c,p,x,r,a){if(r)a.push([p,x]);tbl[p][x]=r?[true,pos,c]:false;return r}
 function e(){return true}
 function o(){var args=arguments;return function(c){var i,l;for(i=0,l=args.length;i<l;i++)if(args[i](c))return true;return false}}
 function q(){var args=arguments;return function(c){var i,l,cp=pos,cl=c.length;for(i=0,l=args.length;i<l;i++)if(!args[i](c)){pos=cp;t(c,cl);return false}return true}}
 function r(m,n,f){return function(c){var i=0,cp=pos,cl=c.length;while(i<m){i++;if(!f(c)){pos=cp;t(c,cl);return false}}cl=c.length;while(i++<n||n==0)if(!f(c))return true;return true}}
 function n(f){return function(){var p=pos,x=f([]);pos=p;return !x}}
 function p(f){return function(){var p=pos,x=f([]);pos=p;return x}}
 function t(a,n){if(a.length>n)a.splice(n)}
 function g(p){return str.charCodeAt(p)}
 function b(p,n){var x=tbl[p][n],c=[],a=[n,x[1]-p,c],y=x[2],i=0,l=y.length,z;for(;i<l;i++){z=y[i];if(z[0]>p)c.push([-1,z[0]-p]);c.push(b(z[0],z[1]));p=tbl[z[0]][z[1]][1]}if(p<x[1]&&c.count)c.push([-1,x[1]-p]);return a}
 return Program([])&&pos==l?[true,b(0,0)]:[false,pos,tbl]}
Program.names=['Program','FunctionBody','FunctionDeclaration','FunctionExpr','FormalParameterList','UseStrictDirective','Statement','Block','VariableStatement','VariableDeclarationListNoIn','VariableDeclaration','VariableDeclarationNoIn','EmptyStatement','ExprStatement','IfStatement','IterationStatement','DoWhileStatement','WhileStatement','ForInStatement','ForStatement','ContinueStatement','BreakStatement','ReturnStatement','WithStatement','LabelledStatement','SwitchStatement','CaseClause','DefaultClause','ThrowStatement','TryStatement','Catch','Finally','DebuggerStatement','Expr','ExprNoIn','AssignmentExpr','AssignmentExprNoIn','AssignmentOperator','ConditionalExpr','ConditionalExprNoIn','LogicalOrExpr','LogicalOrExprNoIn','LogicalAndExpr','LogicalAndExprNoIn','BitwiseOrExpr','BitwiseOrExprNoIn','BitwiseXOrExpr','BitwiseXOrExprNoIn','BitwiseAndExpr','BitwiseAndExprNoIn','EqualityExpr','EqualityExprNoIn','EqualityOp','RelationalExpr','RelationalExprNoIn','RelationalOp','RelationalOpNoIn','ShiftExpr','ShiftOp','AdditiveExpr','AdditiveOp','MultiplicativeExpr','MultiplicativeOp','UnaryExpr','PostfixExpr','LeftHandSideExpr','CallExpr','Arguments','ArgumentList','NewExpr','MemberExpr','PrimaryExpr','ArrayLiteral','ElementList','Elision','ObjectLiteral','PropertyNameAndValueList','PropertyAssignment','PropertyName','PropertySetParameterList','Literal','NullLiteral','BooleanLiteral','NumericLiteral','DecimalLiteral','DecimalIntegerLiteral','DecimalDigit','ExponentPart','SignedInteger','HexIntegerLiteral','DQ','SQ','StringLiteral','RS','DoubleStringCharacter','SingleStringCharacter','LineContinuation','EscapeSequence','CharacterEscapeSequence','SingleEscapeCharacter','NonEscapeCharacter','EscapeCharacter','HexEscapeSequence','UnicodeEscapeSequence','RegularExpressionLiteral','RegularExpressionBody','RegularExpressionFirstChar','RegularExpressionChar','RegularExpressionBackslashSequence','RegularExpressionClass','RegularExpressionClassChar','RegularExpressionFlags','SourceCharacter','WhiteSpace','LF','CR','LS','PS','LineTerminator','LineTerminatorSequence','Comment','MultiLineComment','MultiLineCommentNoLB','SingleLineComment','S','SnoLB','EOS','EOSnoLB','EOF','ReservedWord','Keyword','FutureReservedWord','Identifier','IdentifierName','IdentifierStart','IdentifierPart','UnicodeLetter','HexDigit','FalseTok','TrueTok','NullTok','BreakTok','ContinueTok','DebuggerTok','InTok','InstanceOfTok','DeleteTok','FunctionTok','NewTok','ThisTok','TypeofTok','VoidTok','IfTok','ElseTok','DoTok','WhileTok','ForTok','VarTok','ReturnTok','CaseTok','DefaultTok','SwitchTok','ThrowTok','CatchTok','FinallyTok','TryTok','WithTok'];

var peg = require('./peg') ;

function walkTree(tree, names, source) {
  // we use the index because it compares faster
  var Statement = names.indexOf('Statement') ;
  var cursor ;
  
  // node[0] => NodeType (an index into names)
  // node[1] => length of the node's source text
  // node[2] => an array of child nodes or undefined if there aren't any
  function walk(node, position, indent) {
    // handle the current node
    var nameIdx = node[0] ;
    var text = source.slice(position, position+node[1]) ;
    
    //
    // remove unwanted assertion statements in production code
    //
    var regex = /^hub_(assert|precondition|postcondition|invariant|error)\(.*/ ;
    
    if (nameIdx === Statement && text.match(regex)) {
      cursor = (position + text.length) ;
      return ; // don't output anything, don't visit children
    }
    
    // does this node have children? if not, return immediately
    var ary = node[2] ;
    if (!ary) return ;
    
    // handle this node's children
    for (var idx=0, len=ary.length; idx<len; ++idx) {
      var child = ary[idx] ;
      walk(child, position, indent+1) ;
      position += child[1] ;
      if (cursor < position) {
        print(source.slice(cursor, position)) ;
        cursor = position ;
      }
    }
  }
  
  function print(text) {
    process.stdout.write(text) ;
  }
  
  cursor = 0 ;
  walk(tree, cursor, 0) ;
}

var fs = require("fs") ;

fs.readFile(process.ARGV[2], function(err, content) {
  if (!err) {
    parse = Program(content) ;
    if (parse[0] === true) {
      walkTree(parse[1], Program.names, content) ;
    } else {
      process.stdio.writeError("Parsing failed.") ;
      process.exit(1) ;
    }
  } else {
    process.stdio.writeError(err) ;
    process.exit(1) ;
  }
  process.stdout.close() ;
  process.exit() ;
});
