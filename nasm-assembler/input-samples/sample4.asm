section data
	a db 'abcd',255,0
	b dd 'a'
	d dd 'qs'
	e dd 'rrt'
	f dd 'gert'
	g dd 'sdfer'
	h dd 'wersdf'

section .text
	global main

main:
l4:	mov eax,g
l5:	add eax, 10
l6:	sub ecx, edx
	jmp l1
	jmp l2
	jmp l3
	mov edi, 10
l1:	add ecx, a
l2:	mov ecx,ecx
	jmp l4
	jmp l5
	jmp l6
l3:	cmp ebx, ecx
	int 80h

