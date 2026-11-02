%{
    #include <stdio.h>
    #include <string.h>
    void yyerror(char *mensaje);
    int yylex();
    void nuevaTemp(char *temporal);
    void nuevaEtiqueta(char *etiqueta);
    void pushEtiqueta(char *et);
    void popEtiqueta(char *et);

    #define MAX_ETIQUETAS 100
    char pilaEtiquetas[MAX_ETIQUETAS][10];
    int topeEtiquetas = 0;
%}

%union {
    char cadena[100];
}


%token MAIN DEC READ WRITE WHILE FOR IF ELSE
%token <cadena> ID NUMERO
%token MAS MENOS POR DIV POT PARENTESIS_IZQ PARENTESIS_DER LLAVE_IZQ LLAVE_DER FS
%token COMA MENOR MAYOR MAYORIGUAL MENORIGUAL IGUALIGUAL DIFERENTE IGUAL AND OR INVALIDO
%type <cadena> expresion termino potencia factor variable numero condicion termino_logico comparacion sc

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

ciclo : WHILE 
{
       char l_inicio[10], l_fin[10];
       nuevaEtiqueta(l_inicio);
       nuevaEtiqueta(l_fin);

       pushEtiqueta(l_fin);
       pushEtiqueta(l_inicio);

       printf("%s: ", l_inicio);

}PARENTESIS_IZQ condicion PARENTESIS_DER 
{
       char l_fin[10];
       strcpy(l_fin, pilaEtiquetas[topeEtiquetas - 2]);

       printf("\tifZ %s goto %s;\n", $4, l_fin);
}
LLAVE_IZQ bloque LLAVE_DER
{
       char l_inicio[10], l_fin[10];
       popEtiqueta(l_inicio);
       popEtiqueta(l_fin);

       printf("\tgoto %s;\n", l_inicio);
       printf("%s: ", l_fin);
}


      | FOR PARENTESIS_IZQ asignacion FS
{
       char l_inicio[10], l_fin[10];
       nuevaEtiqueta(l_inicio);
       nuevaEtiqueta(l_fin);

       pushEtiqueta(l_fin);
       pushEtiqueta(l_inicio);

       printf("%s: ", l_inicio);
} 
      condicion FS
{
       char l_fin[10];
       strcpy(l_fin, pilaEtiquetas[topeEtiquetas - 2]);

       printf("\tifZ %s goto %s;\n", $6, l_fin);
}
      asignacion PARENTESIS_DER LLAVE_IZQ bloque LLAVE_DER
{
       char l_inicio[10], l_fin[10];
       popEtiqueta(l_inicio);
       popEtiqueta(l_fin);

       printf("\tgoto %s;\n", l_inicio);
       printf("%s: ", l_fin);
}
      ;

si : IF PARENTESIS_IZQ condicion PARENTESIS_DER 
{
       char l_falso[10], l_fin[10];
       nuevaEtiqueta(l_falso);
       nuevaEtiqueta(l_fin);

       pushEtiqueta(l_fin);
       pushEtiqueta(l_falso);

       printf("\tifZ %s goto %s;\n", $3, l_falso);
}
LLAVE_IZQ bloque LLAVE_DER opc_else
   ;

opc_else : ELSE 
{
       char l_falso[10], l_fin[10];
       popEtiqueta(l_falso);
       strcpy(l_fin, pilaEtiquetas[topeEtiquetas - 1]); 

       printf("\tgoto %s;\n", l_fin);
       printf("%s: ", l_falso);
}
LLAVE_IZQ bloque LLAVE_DER
{
       char l_fin[10];
       popEtiqueta(l_fin);
       printf("%s: ", l_fin);
}
         | // CASO VACIO if abierto
{
       char l_falso[10], l_fin[10];
       popEtiqueta(l_falso); 
       popEtiqueta(l_fin);   

       printf("%s: ", l_falso);
}
         ;

sc : MENOR        { strcpy($$, "<"); }
   | MAYOR        { strcpy($$, ">"); }
   | MAYORIGUAL   { strcpy($$, ">="); }
   | MENORIGUAL   { strcpy($$, "<="); }
   | IGUALIGUAL   { strcpy($$, "=="); }
   | DIFERENTE    { strcpy($$, "<>"); }
   ;


condicion : condicion OR termino_logico {nuevaTemp($$); printf("\t%s=%s || %s;\n",$$,$1,$3);  }
          | termino_logico
          ;

termino_logico : termino_logico AND comparacion {nuevaTemp($$); printf("\t%s=%s && %s;\n",$$,$1,$3);  }
               | comparacion
               ;

comparacion : variable sc variable {nuevaTemp($$); printf("\t%s=%s%s%s;\n", $$, $1 + 1, $2, $3 + 1);}
                   | variable sc numero {nuevaTemp($$); printf("\t%s=%s%s%s;\n", $$, $1 + 1, $2, $3);  }
                   | numero sc variable {nuevaTemp($$); printf("\t%s=%s%s%s;\n", $$, $1, $2, $3 + 1); }
                   | numero sc numero {nuevaTemp($$); printf("\t%s=%s%s%s;\n", $$, $1, $2, $3);  }
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

void nuevaEtiqueta(char *etiqueta){
   static int actual=1;
   sprintf(etiqueta,"l%d",actual++);
}

void pushEtiqueta(char *et){
       if(topeEtiquetas < MAX_ETIQUETAS) {
           strcpy(pilaEtiquetas[topeEtiquetas++], et);
       } else {
           fprintf(stderr, "Error: pila de etiquetas llena\n");
       }
}

void popEtiqueta(char *et){
       if(topeEtiquetas > 0) {
           strcpy(et, pilaEtiquetas[--topeEtiquetas]);
       } else {
           fprintf(stderr, "Error: pila de etiquetas vacía\n");
       }
}

void yyerror(char *mensaje) {
    extern int yylineno;
    extern char *yytext;
    fprintf(stderr, "Error de procesamiento: %s en la linea %i, cerca de %s\n", mensaje, yylineno, yytext);
}