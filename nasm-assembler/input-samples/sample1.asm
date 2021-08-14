section .data
	a db 'nasm',10,0
	b dd 10,20

section .bss


section .text
	global main

main:
	mov ecx, edx            ;
	mov ecx, 100000         ;
	mov ecx, b              ;
	mov eax, dword[123]     ;
	add ecx, dword[123]     ;
	add edx, dword[123]     ;
	add ebx, dword[123]     ;
	add esp, dword[123]     ;
	add ebp, dword[123]     ;
	add esi, dword[123]     ;
	add edi, dword[b]       ;

	add ecx, ecx            ;
	add ecx, 10         ;
	add ecx, b              ;
	add ecx, dword[123]     ;
	add ecx, dword[b]       ;

	sub ecx, ecx            ;
	sub ecx, 100000         ;
	sub ecx, b              ;
	sub ecx, dword[123]     ;
	sub ecx, dword[b]       ;

	cmp ecx, ecx            ;
	cmp ecx, 100000         ;
	cmp ecx, b              ;
	cmp ecx, dword[123]     ;
	cmp ecx, dword[b]       ;

	mul dword[123]          ;

	int 80h                 ;


