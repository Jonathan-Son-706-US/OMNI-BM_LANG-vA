%{
    #include <stdio.h>
    #include <string.h>
    #include <stdlib.h>
    #include <stdarg.h>
    void yyerror(char *mensaje);
    int yylex();
    void nuevaTemp(char *temporal);
    void nuevaEtiqueta(char *etiqueta);
    void pushEtiqueta(char *et);
    void popEtiqueta(char *et);
    void registrarVar(char *nombre);
    void nasm(char *formato, ...);
    void nasmCargar(char *reg, char *s);
    void nasmAsignar(char *destino, char *valor);
    void nasmOperacion(char *resultado, char *a, char *op, char *b);
    void nasmEtiqueta(char *et);
    void nasmSalto(char *et);
    void nasmSaltoSiCero(char *temp, char *et);
    void nasmLeer(char *var);
    void nasmEscribir(char *var);
    void generarNasm(FILE *salida);

    FILE *cuerpo;
    char variables[200][100];
    int totalVariables = 0;
    int totalTemps = 0;
    int totalPot = 0;

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

asignacion : variable IGUAL expresion {printf("\t%s=%s;\n", $1 + 1, $3); nasmAsignar($1 + 1, $3);}
           ;

expresion : expresion MAS termino { nuevaTemp($$); printf("\t%s=%s+%s;\n",$$,$1,$3); nasmOperacion($$, $1, "+", $3); }
          | expresion MENOS termino { nuevaTemp($$); printf("\t%s=%s-%s;\n",$$,$1,$3); nasmOperacion($$, $1, "-", $3); }
          | termino     {strcpy($$, $1); }
          ;

termino : termino POR potencia {nuevaTemp($$); printf("\t%s=%s*%s;\n",$$,$1,$3); nasmOperacion($$, $1, "*", $3); }
        | termino DIV potencia {nuevaTemp($$); printf("\t%s=%s/%s;\n",$$,$1,$3); nasmOperacion($$, $1, "/", $3); }
        | potencia  
        ;

potencia : factor POT potencia  {nuevaTemp($$); printf("\t%s=%s:%s;\n",$$,$1,$3); nasmOperacion($$, $1, ":", $3); }
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
       nasmEtiqueta(l_inicio);

}PARENTESIS_IZQ condicion PARENTESIS_DER 
{
       char l_fin[10];
       strcpy(l_fin, pilaEtiquetas[topeEtiquetas - 2]);

       printf("\tifZ %s goto %s;\n", $4, l_fin);
       nasmSaltoSiCero($4, l_fin);
}
LLAVE_IZQ bloque LLAVE_DER
{
       char l_inicio[10], l_fin[10];
       popEtiqueta(l_inicio);
       popEtiqueta(l_fin);

       printf("\tgoto %s;\n", l_inicio);
       printf("%s: ", l_fin);
       nasmSalto(l_inicio);
       nasmEtiqueta(l_fin);
}


      | FOR PARENTESIS_IZQ asignacion FS
{
       char l_inicio[10], l_cuerpo[10], l_inc[10], l_fin[10];
       nuevaEtiqueta(l_inicio);
       nuevaEtiqueta(l_cuerpo);
       nuevaEtiqueta(l_inc);
       nuevaEtiqueta(l_fin);

       pushEtiqueta(l_fin);
       pushEtiqueta(l_inc);
       pushEtiqueta(l_cuerpo);
       pushEtiqueta(l_inicio);

       printf("%s: ", l_inicio);
       nasmEtiqueta(l_inicio);
} 
      condicion FS
{
       char l_cuerpo[10], l_inc[10], l_fin[10];
       strcpy(l_cuerpo, pilaEtiquetas[topeEtiquetas - 2]);
       strcpy(l_inc, pilaEtiquetas[topeEtiquetas - 3]);
       strcpy(l_fin, pilaEtiquetas[topeEtiquetas - 4]);

       printf("\tifZ %s goto %s;\n", $6, l_fin);
       printf("\tgoto %s;\n", l_cuerpo);
       printf("%s: ", l_inc);
       nasmSaltoSiCero($6, l_fin);
       nasmSalto(l_cuerpo);
       nasmEtiqueta(l_inc);
}
      asignacion PARENTESIS_DER
{
       char l_inicio[10], l_cuerpo[10];
       strcpy(l_inicio, pilaEtiquetas[topeEtiquetas - 1]);
       strcpy(l_cuerpo, pilaEtiquetas[topeEtiquetas - 2]);

       printf("\tgoto %s;\n", l_inicio);
       printf("%s: ", l_cuerpo);
       nasmSalto(l_inicio);
       nasmEtiqueta(l_cuerpo);
}
      LLAVE_IZQ bloque LLAVE_DER
{
       char l_inicio[10], l_cuerpo[10], l_inc[10], l_fin[10];
       popEtiqueta(l_inicio);
       popEtiqueta(l_cuerpo);
       popEtiqueta(l_inc);
       popEtiqueta(l_fin);

       printf("\tgoto %s;\n", l_inc);
       printf("%s: ", l_fin);
       nasmSalto(l_inc);
       nasmEtiqueta(l_fin);
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
       nasmSaltoSiCero($3, l_falso);
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
       nasmSalto(l_fin);
       nasmEtiqueta(l_falso);
}
LLAVE_IZQ bloque LLAVE_DER
{
       char l_fin[10];
       popEtiqueta(l_fin);
       printf("%s: ", l_fin);
       nasmEtiqueta(l_fin);
}
         | // CASO VACIO if abierto
{
       char l_falso[10], l_fin[10];
       popEtiqueta(l_falso); 
       popEtiqueta(l_fin);   

       printf("%s: ", l_falso);
       nasmEtiqueta(l_falso);
}
         ;

sc : MENOR        { strcpy($$, "<"); }
   | MAYOR        { strcpy($$, ">"); }
   | MAYORIGUAL   { strcpy($$, ">="); }
   | MENORIGUAL   { strcpy($$, "<="); }
   | IGUALIGUAL   { strcpy($$, "=="); }
   | DIFERENTE    { strcpy($$, "<>"); }
   ;


condicion : condicion OR termino_logico {nuevaTemp($$); printf("\t%s=%s || %s;\n",$$,$1,$3); nasmOperacion($$, $1, "||", $3); }
          | termino_logico
          ;

termino_logico : termino_logico AND comparacion {nuevaTemp($$); printf("\t%s=%s && %s;\n",$$,$1,$3); nasmOperacion($$, $1, "&&", $3); }
               | comparacion
               ;

comparacion : variable sc variable {nuevaTemp($$); printf("\t%s=%s%s%s;\n", $$, $1 + 1, $2, $3 + 1); nasmOperacion($$, $1 + 1, $2, $3 + 1);}
                   | variable sc numero {nuevaTemp($$); printf("\t%s=%s%s%s;\n", $$, $1 + 1, $2, $3); nasmOperacion($$, $1 + 1, $2, $3); }
                   | numero sc variable {nuevaTemp($$); printf("\t%s=%s%s%s;\n", $$, $1, $2, $3 + 1); nasmOperacion($$, $1, $2, $3 + 1); }
                   | numero sc numero {nuevaTemp($$); printf("\t%s=%s%s%s;\n", $$, $1, $2, $3); nasmOperacion($$, $1, $2, $3); }
                   ;


declarar : DEC variable { registrarVar($2 + 1); } otra_variable
         ;

lectura : READ variable { printf("\tcall input;\n"); }{printf("\tpop %s;\n", $2 + 1); nasmLeer($2 + 1);}
        ;

escritura : WRITE variable {printf("\tpush %s;\n", $2 + 1); printf("\tcall output;\n"); nasmEscribir($2 + 1);}
          ;

variable : ID
         ;

otra_variable : COMA variable { registrarVar($2 + 1); } otra_variable
              | vacio
              ;

numero : NUMERO { strcpy($$, $1); } | MENOS NUMERO { strcpy($$, "-"); strcat($$, $2); }
       ;

vacio :
      ;

%%

int main() {
    int resultado;
    cuerpo = tmpfile();
    resultado = yyparse();
    if (resultado == 0) {
        FILE *salida = fopen("salida.asm", "w");
        if (salida) {
            generarNasm(salida);
            fclose(salida);
        }
    }
    return resultado;
}

void nuevaTemp(char *temporal){
   static int actual = 1;
   sprintf(temporal, "t%d", actual++);
   totalTemps = actual - 1;
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
void registrarVar(char *nombre){
   int i;
   for(i = 0; i < totalVariables; i++){
       if(strcmp(variables[i], nombre) == 0) return;
   }
   if(totalVariables < 200) strcpy(variables[totalVariables++], nombre);
}

int esNumero(char *s){
   if(s[0] == '-' && s[1] >= '0' && s[1] <= '9') return 1;
   return s[0] >= '0' && s[0] <= '9';
}

int esTemp(char *s){
   int i;
   if(s[0] != 't' || s[1] == '\0') return 0;
   for(i = 1; s[i]; i++){
       if(s[i] < '0' || s[i] > '9') return 0;
   }
   return 1;
}

void operando(char *dest, char *s){
   if(esNumero(s)) strcpy(dest, s);
   else if(esTemp(s)) sprintf(dest, "[%s]", s);
   else {
       registrarVar(s);
       sprintf(dest, "[v_%s]", s);
   }
}

void nasm(char *formato, ...){
   va_list args;
   va_start(args, formato);
   vfprintf(cuerpo, formato, args);
   va_end(args);
}

void nasmCargar(char *reg, char *s){
   char op[120];
   operando(op, s);
   nasm("\tmov %s, %s\n", reg, op);
}

void nasmAsignar(char *destino, char *valor){
   nasmCargar("eax", valor);
   registrarVar(destino);
   nasm("\tmov [v_%s], eax\n", destino);
}

void nasmOperacion(char *resultado, char *a, char *op, char *b){
   char A[120], B[120];
   operando(A, a);
   operando(B, b);
   if(strcmp(op, ":") == 0){
       totalPot++;
       nasm("\tmov ebx, %s\n\tmov ecx, %s\n\tmov eax, 1\n", A, B);
       nasm("pot%d:\n\tcmp ecx, 0\n\tjle finpot%d\n\timul eax, ebx\n\tdec ecx\n\tjmp pot%d\nfinpot%d:\n", totalPot, totalPot, totalPot, totalPot);
   } else {
       nasm("\tmov eax, %s\n", A);
       if(strcmp(op, "+") == 0) nasm("\tadd eax, %s\n", B);
       else if(strcmp(op, "-") == 0) nasm("\tsub eax, %s\n", B);
       else if(strcmp(op, "*") == 0) nasm("\timul eax, %s\n", B);
       else if(strcmp(op, "/") == 0) nasm("\tcdq\n\tmov ecx, %s\n\tidiv ecx\n", B);
       else if(strcmp(op, "&&") == 0) nasm("\tand eax, %s\n", B);
       else if(strcmp(op, "||") == 0) nasm("\tor eax, %s\n", B);
       else {
           char *set = "sete";
           if(strcmp(op, "<") == 0) set = "setl";
           else if(strcmp(op, ">") == 0) set = "setg";
           else if(strcmp(op, "<=") == 0) set = "setle";
           else if(strcmp(op, ">=") == 0) set = "setge";
           else if(strcmp(op, "==") == 0) set = "sete";
           else if(strcmp(op, "<>") == 0) set = "setne";
           nasm("\tcmp eax, %s\n\t%s al\n\tmovzx eax, al\n", B, set);
       }
   }
   nasm("\tmov [%s], eax\n", resultado);
}

void nasmEtiqueta(char *et){
   nasm("%s:\n", et);
}

void nasmSalto(char *et){
   nasm("\tjmp %s\n", et);
}

void nasmSaltoSiCero(char *temp, char *et){
   nasmCargar("eax", temp);
   nasm("\tcmp eax, 0\n\tje %s\n", et);
}

void nasmLeer(char *var){
   registrarVar(var);
   nasm("\tcall input\n\tmov [v_%s], eax\n", var);
}

void nasmEscribir(char *var){
   registrarVar(var);
   nasm("\tpush dword [v_%s]\n\tcall output\n\tadd esp, 4\n", var);
}

void generarNasm(FILE *salida){
   int i, c;
   fprintf(salida, "section .bss\n");
   for(i = 0; i < totalVariables; i++) fprintf(salida, "\tv_%s resd 1\n", variables[i]);
   for(i = 1; i <= totalTemps; i++) fprintf(salida, "\tt%d resd 1\n", i);
   fprintf(salida, "\tbuf_in resb 16\n\tbuf_out resb 16\n\n");
   fprintf(salida, "section .text\n\tglobal _start\n\n_start:\n");
   rewind(cuerpo);
   while((c = fgetc(cuerpo)) != EOF) fputc(c, salida);
   fputs(
       "\tmov eax, 1\n"
       "\txor ebx, ebx\n"
       "\tint 0x80\n\n"
       "input:\n"
       "\tpush ebx\n\tpush ecx\n\tpush edx\n\tpush esi\n\tpush edi\n"
       "\txor esi, esi\n\txor edi, edi\n"
       ".leer:\n"
       "\tmov eax, 3\n\tmov ebx, 0\n\tmov ecx, buf_in\n\tmov edx, 1\n\tint 0x80\n"
       "\tcmp eax, 1\n\tjne .fin\n"
       "\tmovzx eax, byte [buf_in]\n\tcmp eax, 10\n\tje .fin\n"
       "\tcmp eax, '-'\n\tjne .digito\n\tmov edi, 1\n\tjmp .leer\n"
       ".digito:\n"
       "\tcmp eax, '0'\n\tjl .leer\n\tcmp eax, '9'\n\tjg .leer\n"
       "\tsub eax, '0'\n\timul esi, 10\n\tadd esi, eax\n\tjmp .leer\n"
       ".fin:\n"
       "\tmov eax, esi\n\tcmp edi, 0\n\tje .listo\n\tneg eax\n"
       ".listo:\n"
       "\tpop edi\n\tpop esi\n\tpop edx\n\tpop ecx\n\tpop ebx\n\tret\n\n"
       "output:\n"
       "\tpush ebp\n\tmov ebp, esp\n\tpush ebx\n\tpush ecx\n\tpush edx\n\tpush esi\n"
       "\tmov eax, [ebp+8]\n\tmov esi, buf_out + 15\n\tmov byte [esi], 10\n\tmov ebx, 0\n"
       "\tcmp eax, 0\n\tjge .convertir\n\tmov ebx, 1\n\tneg eax\n"
       ".convertir:\n"
       "\tmov ecx, 10\n"
       ".ciclo:\n"
       "\txor edx, edx\n\tdiv ecx\n\tadd dl, '0'\n\tdec esi\n\tmov [esi], dl\n\tcmp eax, 0\n\tjne .ciclo\n"
       "\tcmp ebx, 0\n\tje .imprimir\n\tdec esi\n\tmov byte [esi], '-'\n"
       ".imprimir:\n"
       "\tmov edx, buf_out + 16\n\tsub edx, esi\n\tmov ecx, esi\n\tmov ebx, 1\n\tmov eax, 4\n\tint 0x80\n"
       "\tpop esi\n\tpop edx\n\tpop ecx\n\tpop ebx\n\tpop ebp\n\tret\n",
       salida);
}