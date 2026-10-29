%{
    #include <stdio.h>
    #include <string.h>
    void yyerror(char *mensaje);
    int yylex();
    void nuevaTemp(char *temporal);
%}

%union {
    char cadena[100];
}


%token MAIN DEC READ WRITE WHILE FOR IF ELSE
%token <cadena> ID NUMERO
%token MAS MENOS POR DIV POT PARENTESIS_IZQ PARENTESIS_DER LLAVE_IZQ LLAVE_DER FS
%token COMA MENOR MAYOR MAYORIGUAL MENORIGUAL IGUALIGUAL DIFERENTE IGUAL AND OR INVALIDO
%type <cadena> expresion termino potencia factor variable numero

%%

inicio : programa
       | inicio programa
       ;

programa : MAIN LLAVE_IZQ { printf("main:\n"); } bloque LLAVE_DER { printf("\tPrograma valido\n"); }
         ;

bloque : sentencia otra_sentencia | vacio
       ;

otra_sentencia : sentencia otra_sentencia
               | vacio
               ;

sentencia : asignacion FS
          | lectura FS
          | escritura FS
          | declarar FS
          | ciclo
          | si
          ;

asignacion : variable IGUAL expresion {printf("\t%s=%s;\n", $1 + 1, $3);}
           ;

expresion : expresion MAS termino { nuevaTemp($$); printf("\t%s=%s+%s;\n",$$,$1,$3);  }
          | expresion MENOS termino { nuevaTemp($$); printf("\t%s=%s-%s;\n",$$,$1,$3);  }
          | termino     {strcpy($$, $1); }
          ;

termino : termino POR potencia {nuevaTemp($$); printf("\t%s=%s*%s;\n",$$,$1,$3);  }
        | termino DIV potencia {nuevaTemp($$); printf("\t%s=%s/%s;\n",$$,$1,$3);  }
        | potencia  
        ;

potencia : factor POT potencia  {strcpy($$, $1); }
         | factor   {strcpy($$, $1); }
         ;

factor : PARENTESIS_IZQ expresion PARENTESIS_DER { strcpy($$, $2); }
       | variable { strcpy($$, $1 + 1); }
       | numero { strcpy($$, $1); }
       ;

ciclo : WHILE PARENTESIS_IZQ condicion PARENTESIS_DER LLAVE_IZQ bloque LLAVE_DER
      | FOR PARENTESIS_IZQ asignacion FS condicion FS asignacion PARENTESIS_DER LLAVE_IZQ bloque LLAVE_DER
      ;

si : si_emparejado
   | si_abierto
   ;

si_emparejado : IF PARENTESIS_IZQ condicion PARENTESIS_DER LLAVE_IZQ bloque LLAVE_DER ELSE LLAVE_IZQ bloque LLAVE_DER
              ;

si_abierto : IF PARENTESIS_IZQ condicion PARENTESIS_DER LLAVE_IZQ bloque LLAVE_DER
           | IF PARENTESIS_IZQ condicion PARENTESIS_DER LLAVE_IZQ bloque LLAVE_DER ELSE si_abierto
           ;

sc : MENOR
   | MAYOR
   | MAYORIGUAL
   | MENORIGUAL
   | IGUALIGUAL
   | DIFERENTE
   ;
   ;


condicion : condicion OR termino_logico
          | termino_logico
          ;

termino_logico : termino_logico AND comparacion
               | comparacion
               ;

comparacion : variable sc variable
                   | variable sc numero
                   | numero sc variable
                   | numero sc numero
                   ;


declarar : DEC variable otra_variable
         ;

lectura : READ variable { printf("\tcall input;\n"); }{printf("\tpop %s;\n", $2 + 1);}
        ;

escritura : WRITE variable {printf("\tpush %s;\n", $2 + 1); printf("\tcall output;\n");}
          ;

variable : ID
         ;

otra_variable : COMA variable otra_variable
              | vacio
              ;

numero : NUMERO { strcpy($$, $1); } | MENOS NUMERO { strcpy($$, $2); }
       ;

vacio :
      ;

%%

int main() {
    yyparse();
    return 0;
}

void nuevaTemp(char *temporal){
   static int actual = 1;
   sprintf(temporal, "t%d", actual++);
}

void yyerror(char *mensaje) {
    extern int yylineno;
    extern char *yytext;
    fprintf(stderr, "Error de procesamiento: %s en la linea %i, cerca de %s\n", mensaje, yylineno, yytext);
}