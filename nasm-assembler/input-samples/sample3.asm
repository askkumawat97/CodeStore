section data
	a1 db 'abcd efgh', "asd", 255,0
	a db 'akjdfhaekl',10,0
	b dd 'a'
	d dd 'qs'
	e dd 'rrt'
	f dd 'gert'
	g dd 'sdfer',1
	h dd 'wersdf'

section .text
	global main

main:
l4:	mov eax,g
l5:	add eax, 10
l6:	sub ecx, edx
	mov ecx, dword[a]
	mov eax, dword[123]
	mul dword[123]
	div dword[a]
	add edi, dword[123]

	jmp l1
	jmp l2
	jmp l3
	mov edi, dword[123]
	jmp l1
l1:
	jmp l1
l2:	mov ecx,ecx
	jmp l4
	jmp l5
	jmp l6
l3:	cmp ebx, ecx
	int 80h

