%{
    #include "proyecto.tab.h"
%}

%option noyywrap
%option yylineno

%%
"#!"([^!\n]|"!"+[^!#\n])*"!"+"#"   { }
"MAIN"                 { return MAIN; }
"DEC"                  { return DEC; }
"READ"                 { return READ; }
"WRITE"                { return WRITE; }
"WHILE"                { return WHILE; }
"FOR"                  { return FOR; }
"IF"                   { return IF; }
"ELSE"                 { return ELSE; }
\$[a-zA-Z_][a-zA-Z0-9_]* { strcpy(yylval.cadena, yytext); return ID; }
[0-9]+                 { strcpy(yylval.cadena, yytext); return NUMERO; }
"+"                    { return MAS; }
"-"                    { return MENOS; }
"*"                    { return POR; }
"/"                    { return DIV; }
":"                    { return POT; }
"("                    { return PARENTESIS_IZQ; }
")"                    { return PARENTESIS_DER; }
"{"                    { return LLAVE_IZQ; }
"}"                    { return LLAVE_DER; }
";"                    { return FS; }
","                    { return COMA; }
"<"                    { return MENOR; }
">"                    { return MAYOR; }
"<="                   { return MENORIGUAL; }
">="                   { return MAYORIGUAL; }
"=="                   { return IGUALIGUAL; }
"<>"                   { return DIFERENTE; }
"=>"                   { return IGUAL; }
"||"                   { return OR; }
"&&"                  { return AND;}
[ \t\r]                { }
[\n]                   { }
.                      { return INVALIDO; }

%%