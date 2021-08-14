
#add error for databound exceeds

import sys
from sys import argv

# return 0 if variable name is valid otherwise returns 1
def isValidVar(str1):
	alphabatestr = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
	numberstr = '0123456789'
	validvar = -1
	for x in str1:
		if x in alphabatestr+numberstr+'_'+'.':
			validvar = 0
		else:
			validvar = 1
			break;
	if str1[0][:1] not in alphabatestr+'_'+'.':
		validvar = 1
	return validvar

def bigEndian(hexstr):
	str1 = ''
	for x in range(1, 4):
		str1 = str1+hexstr[((4-x)*2):]
		hexstr = hexstr[:((4-x)*2)]
	str1 = str1+hexstr
	return str1

#byteinc is 4 then return 4byte big endian
#byteinc is 1 then return 1byte
#byteinc is 0 then return 4byte
def integerIntoHex(int1, byteinc):
	hexstr = ''
	hexstr1 = hex(int(int1)).upper()
	hexstr1 = '0'*(10-len(hexstr1))+hexstr1[2:]
	if byteinc == 4:
		hexstr = hexstr1
		hexstr = bigEndian(hexstr)
	elif byteinc == 0:
		hexstr = hexstr1
	else:
		hexstr = hexstr1[6:]
	return hexstr


def stringIntoHex(str1, byteinc):
	hexstr = ''
	for char in str1:
		hexstr = hexstr+hex(ord	(char))[2:]
	if byteinc == 4:
		if len(hexstr)%8 == 0:
			t1 = 0
		else:
			t1 = 8-(len(hexstr)%8)
		hexstr = hexstr+'0'*t1
	return hexstr
		

def incReg(base, reg):
	regesterTable = ['eax','ecx','edx','ebx','esp','ebp','esi','edi']
	index = regesterTable.index(reg)
	digit = hex(int(base[1])+index)[2:]
	base = base[0]
	base = base+digit.upper()
	return base


##########################################################################################

if len(argv) != 2:
	print("gives input file name as argument")
	exit(0)

sourceFile = open(argv[1])
symbolTableFile = open("outputSymbTable.s", "w")
finalHexFile = open("outputHex.lst", "w")
splitFile = []
splitFile1 = []

keywordTable = ['eax','ecx','edx','ebx','esp','ebp','esi','edi', '.data','.text','dd','db','resd','var','label']
opcodeTable = ['mov','add','sub','mul','div','cmp','jmp','int']
regesterTable = ['eax','ecx','edx','ebx','esp','ebp','esi','edi']
symbolTable = [] #id,name,type,address,d/u,size
errorTable = (open("asmErrorTable.txt")).read().split('\n')
literalTable = [] #int,hex
printErrors = []
finalHex = []

for line in sourceFile:
	line = line.replace('\n', '')
	splitFile.append(line)

#print(splitFile)
#print("\n")
#for ele in errorTable:
#	print(ele)
#print("\n")

temp = ''
linenum = 0
for ele in splitFile: #make list of lines ie formated source code
	linenum += 1
	temp = str(linenum)+' '+ele
	temp = temp.replace('\t', '')
	temp = temp.replace(',', ' , ')
	temp = temp.replace(';', ' ; ')
	temp = temp.replace(':', ' : ')
	temp = temp.replace('"', '\'')
	temp = temp.replace('\'', '\'@\'')

	temp = temp.split('\'')
	temp2 = []
	temp3 = []
	flag = 0
	for ele1 in temp:
		if ele1 == '@' and flag == 0:
			flag = 1
			continue
		elif ele1 == '@' and flag == 1:
			flag = 0
			continue

		if flag == 0:
			temp2.append(ele1.split(' '))
		elif flag == 1:
			temp2.append(['\''+ele1+'\''])
		
	for ele1 in temp2:
		temp3 = temp3+ele1
	while '' in temp3:
		temp3.remove('')


	flag = 0
	temp4 = []
	for ele1 in temp3:
		if ele1 == ';': #remove comments
			temp3 = temp3[:temp3.index(ele1)]
		if ele1 == ':': #take label on seperate line
			temp4 = temp3[3:] #[delete:keep] first k ele
			temp4.insert(0, str(linenum))
			temp3 = temp3[:3]
			temp3 = [temp3[0], temp3[1]+temp3[2]]
			flag = 1

	splitFile1.append(temp3)
	if flag == 1 and len(temp4) > 1:
		splitFile1.append(temp4)

#for ele in splitFile1:
#	print(ele)

############################################################################


symbolTableid = 0
address = 0
for lineIndex, inst in enumerate(splitFile1): #read line by line for error/symbol table
	bytes = 0 
	byteinc = 0 
	variableflag = 0 #variable declaration found then proceed

	if len(inst) < 2:
		continue
	elif inst[1] == 'section' or inst[1] == 'global':
		if len(inst) == 2:
			#WAR-macro exists, but not taking 0 parameters
			printErrors.append(inst[0])
			printErrors.append(1)
			continue
		elif len(inst) == 3:
			validvar = isValidVar(inst[2])
			if validvar == 0 and inst[1] == 'section':
				address = 0;
			elif validvar == 0:
				#inst[2] inserts into SYMBOLTABLE with U
				#search label in symbol table, if already found
				#WAR-GLOBAL directive after symbol definition is
				#an experimental feature
				if inst[2] in symbolTable:
					printErrors.append(inst[0])
					printErrors.append(12)
					continue
				else:
					symbolTable.append(inst[0])
					symbolTable.append(inst[2])
					symbolTable.append('label')
					symbolTable.append(0)
					symbolTable.append('U')
					symbolTable.append(0)
					continue	
			else:
				#ERR-identifier expected after macro
				printErrors.append(inst[0])
				printErrors.append(2)
				continue
		else:
			if inst[1] == 'section':
				#ERR-Unknown section attribute ignored
				printErrors.append(inst[0])
				printErrors.append(3)
				continue
			elif inst[1] == 'global':
				#ERR-macro global have many parameters
				printErrors.append(inst[0])
				printErrors.append(4)
				continue


	elif inst[1] in opcodeTable:
		opflag = 1		
		if len(inst) == 3:
			if inst[1] == 'jmp':
				if inst[2] in keywordTable+opcodeTable:
					#ERR:invalid combination of opcode and operands
					opflag = 10
				else:
					address = address+2
					opflag = 2
			elif inst[1] == 'int':
				if inst[2] in keywordTable+opcodeTable or inst[2] != '80h':
					#ERR:invalid combination of opcode and operands
					opflag = 10
				else:
					address = address+2
					#opflag = 2
			else:
				if inst[2] in regesterTable:
					address = address+2
				elif inst[2].startswith('dword[') and inst[2].endswith(']'):
					address = address+6
					str1 = inst[2][6:]
					str1 = str1[:len(str1)-1]
					if str1.isdigit():
						if int(str1) > 4294967295:
							#WAR-dword data exceeds bounds
							printErrors.append(inst[0])
							printErrors.append(16)
						continue
					else:
						if str1 not in symbolTable:
							#ERR-unexpected format of dword[imm/var]
							printErrors.append(inst[0])
							printErrors.append(17)
							continue
				else:
					#ERR:invalid combination of opcode and operands
					opflag = 10
		elif len(inst) == 5:
			if inst[3] != ',':
				#ERR-comma expected
				printErrors.append(inst[0])
				printErrors.append(10)
				continue
			elif inst[2] not in regesterTable:
				#ERR:invalid combination of opcode and operands
				opflag = 10
			else:
				if inst[4] in regesterTable:#opcode reg, reg
					address = address+2
				elif inst[4].startswith('dword[') and inst[4].endswith(']'):
					if inst[1] == 'mov' and inst[2] == 'eax':
						address = address+5
					else:
						address = address+6
					str1 = inst[4][6:]
					str1 = str1[:len(str1)-1]
					if str1.isdigit():
						if int(str1) > 4294967295:
							#WAR-dword data exceeds bounds
							printErrors.append(inst[0])
							printErrors.append(16)
							continue
					else:
						if str1 not in symbolTable:
							#ERR-unexpected format of dword[imm/var]
							printErrors.append(inst[0])
							printErrors.append(17)
							continue		
				else: #opcode reg, imm/var
					if inst[1] == 'mov':
						address = address+5
					else:
						if inst[4].isdigit():
							if int(inst[4]) > 255:
								address = address+6
							else: 
								address = address+3
						else: #opcode reg, imm
							address = address+6

					if inst[4].isdigit():
						if int(inst[4]) > 4294967295:
							#WAR-dword data exceeds bounds
							printErrors.append(inst[0])
							printErrors.append(16)
							continue
					else:
						validvar = isValidVar(inst[opflag])
						if validvar == 0:
							opflag = 4
						else:
							#ERR-unexpected label/variable name
							printErrors.append(inst[0])
							printErrors.append(7)
							continue
		else:
			#ERR:invalid combination of opcode and operands
			opflag = 10


		if opflag != 1 and opflag != 10:
			validvar = isValidVar(inst[opflag])
			if validvar == 0:
				if inst[opflag] not in symbolTable:
					symbolTable.append(inst[0])
					symbolTable.append(inst[opflag])
					if opflag == 2:
						symbolTable.append('label')
					elif opflag == 4:
						symbolTable.append('var')
					symbolTable.append(0)
					symbolTable.append('U')
					symbolTable.append(0)
					continue
			else:
				#ERR-unexpected label/variable name
				printErrors.append(inst[0])
				printErrors.append(7)
				continue
		elif opflag == 10:
			#ERR:invalid combination of opcode and operands
			printErrors.append(inst[0])
			printErrors.append(13)
			continue


	else: #label/variable
		labelflag = 0
		if inst[1].endswith(':'):
			labelflag = 1
			inst[1] = inst[1][:len(inst[1])-1]

		if inst[1] in keywordTable:
			#ERR-label or variable expected at start of line
			printErrors.append(inst[0])
			printErrors.append(5)
			continue

		validvar = isValidVar(inst[1])
		if validvar == 0:
			if inst[1] in symbolTable:
				if symbolTable[symbolTable.index(inst[1])+3] == 'D':
					printErrors.append(inst[0])
					str1 = 'symbol \''+inst[1]+'\' is redefined'
					printErrors.append(str1)
					continue
			if len(inst) == 2:
				if labelflag == 1:
					#inst[1] inserts into SYMBOLTABLE with D
					#search label in symbol table, if found 
					#find index and replace data
					if inst[1] in symbolTable:
						index = symbolTable.index(inst[1])
						symbolTable[index+2] = address
						symbolTable[index+3] = 'D'
					else:
						symbolTable.append(inst[0])
						symbolTable.append(inst[1])
						symbolTable.append('label')
						symbolTable.append(address)
						symbolTable.append('D')
						symbolTable.append(0)
						continue
				else:
					#ERR-label without column
					printErrors.append(inst[1])
					printErrors.append(6)
					continue
			elif len(inst) > 2 and (inst[2]=='db' or inst[2]=='dd' or inst[2]=='resd'):
				variableflag = 1
			else:
				#ERR-label without column
				printErrors.append(inst[0])
				printErrors.append(6)
				continue
		else:
			#ERR-unexpected label/variable name
			printErrors.append(inst[0])
			printErrors.append(7)
			continue


	if variableflag == 1:
		if len(inst) == 3:
			#ERR-no operand for data declaration
			printErrors.append(inst[0])
			printErrors.append(9)
			continue
		if inst[2] == 'db':
			byteinc = 1
		elif inst[2] == 'dd':
			byteinc = 4
		symbolTable.append(inst[0])
		symbolTable.append(inst[1])
		symbolTable.append('var')
		symbolTable.append(address)
		symbolTable.append('D')

		for x in range(3, len(inst)):
			if x%2 == 0 and inst[x] != ',':
				#ERR-comma expected
				printErrors.append(inst[0])
				printErrors.append(10)
				break
			elif x%2 != 0:
				if inst[x].isdigit():
					if inst[2] == 'db' and int(inst[x]) > 255:
						#WAR-byte data exceeds bounds
						printErrors.append(inst[0])
						printErrors.append(15)
						continue
					if inst[2] == 'dd' and int(inst[x]) > 4294967295:
						#WAR-dword data exceeds bounds
						printErrors.append(inst[0])
						printErrors.append(16)
						continue

					bytes += byteinc
				elif inst[x].startswith('\'') and inst[x].endswith('\''):
					if len(inst[x]) > 2:
						t1 = int((len(inst[x])-2-1)/byteinc)+1
						bytes = bytes+(t1*byteinc)
				elif type(inst[x]) == str:
					#ERR-reserve non-constant quantity in declaration
					printErrors.append(inst[0])
					printErrors.append(14)
					break
				else:
					#ERR-expression syntex error
					printErrors.append(inst[0])
					printErrors.append(11)
					break
		symbolTable.append(bytes)
		address = address+bytes


#insert errors from symbol table
print("\n")
for ind, ele in enumerate(symbolTable):
	if ele == 'U':
		printErrors.append(str(symbolTable[ind-4]))
		str1 = "symbol "+symbolTable[ind-3]+" is undefined"
		printErrors.append(str1)

###############################################################################
#print("\n")
#print(printErrors)
#print("\n")
for ind, ele in enumerate(printErrors):
	if ind%2 == 0:
		if type(printErrors[ind+1]) != str:
			print(argv[0]+':',' '*(2-len(ele))+ele+':',errorTable[2*(printErrors[ind+1])-1])
		else:
			print(argv[0]+':',' '*(2-len(ele))+ele+':', printErrors[ind+1])






if len(printErrors) != 0:
	sys.exit(0)
else:
	###############################################################################
	print("\n")
	symbolTable1 = []
	str1 = ''
	str1 = '    LINE'+'    NAME'+'    TYPE'+'    ADDR'+'     D/U'+'    SIZE'
	symbolTable1.append(str1)
	for ind, ele in enumerate(symbolTable):
		str1 = ''
		if ind%6 == 0:
			str1 = str1+' '*(8-len(str(symbolTable[ind+0])))+symbolTable[ind+0]
			str1 = str1+' '*(8-len(symbolTable[ind+1]))+symbolTable[ind+1]
			str1 = str1+' '*(8-len(symbolTable[ind+2]))+symbolTable[ind+2]
			str1 = str1+' '*(8-len(str(symbolTable[ind+3])))+str(symbolTable[ind+3])
			str1 = str1+' '*(8-len(str(symbolTable[ind+4])))+symbolTable[ind+4]
			str1 = str1+' '*(8-len(str(symbolTable[ind+5])))+str(symbolTable[ind+5])
			symbolTable1.append(str1)

	for ele in symbolTable1:
		symbolTableFile.write(ele)
		symbolTableFile.write('\n')
		print(ele)
	###############################################################################



	address = 0
	for ind, inst in enumerate(splitFile1): #read line by line for second pass
		if len(inst) < 2:
			finalHex.append(int(splitFile1[ind][0]))
			finalHex.append('')
			finalHex.append('')
			finalHex.append('')
			continue
		elif inst[1] == 'section':
			address = 0
			finalHex.append(int(splitFile1[ind][0]))
			finalHex.append('')
			finalHex.append('')
			instStr = splitFile[int(inst[0])-1]
			finalHex.append(instStr)
			continue
		elif inst[1] == 'global':
			finalHex.append(int(splitFile1[ind][0]))
			finalHex.append('')
			finalHex.append('')
			instStr = splitFile[int(inst[0])-1]
			finalHex.append(instStr)
			continue
		elif len(inst) == 2:
			instStr = splitFile[int(inst[0])-1]
			if instStr.endswith(':'):
				finalHex.append(int(splitFile1[ind][0]))
				finalHex.append('')
				finalHex.append('')
				finalHex.append(instStr)

		elif inst[1] in symbolTable:
			finalHex.append(int(splitFile1[ind][0]))
			index = symbolTable.index(inst[1])
			finalHex.append(integerIntoHex(symbolTable[index+2], 0))
			address = address+(symbolTable[index+4])

			if inst[2] == 'db':
				byteinc = 1
			else:
				byteinc = 4

			hexstr = ''
			for x in range(3, len(inst)):
				if inst[x] == ',':
					continue
				else:
					if inst[x].isdigit():
						hexstr = hexstr+integerIntoHex(inst[x], byteinc)
					elif inst[x].startswith('\'') and inst[x].endswith('\''):
						inst[x] = inst[x].strip('\'')
						hexstr = hexstr+stringIntoHex(inst[x], byteinc)
					
			finalHex.append(hexstr)
			instStr = splitFile[int(inst[0])-1]
			finalHex.append(instStr)


		elif inst[1] in opcodeTable:
			finalHex.append(int(splitFile1[ind][0]))
			finalHex.append(integerIntoHex(address, 0))

			str1 = ''
			str1flag = 0
			hexstr = ''
			if inst[1] == 'jmp':
				if inst[2].startswith('dword[') and inst[2].endswith(']'):
					hexstr = 'FF25'
					address = address+6
					str1 = inst[2][6:]
					str1 = str1[:len(str1)-1]
					str1flag = 1
				else:
					address = address+2
					jmplabeladdr = symbolTable[symbolTable.index(inst[2])+2]
					#print(jmplabeladdr,' ' ,address)
					if jmplabeladdr >= address: #forward jump
						hexstr = 'EB'+integerIntoHex(jmplabeladdr-address, 1)
					else: #backward jump
						twoscompvar = 256-(address-jmplabeladdr)
						hexstr = 'EB'+integerIntoHex(twoscompvar, 1)

			elif inst[1] == 'int':
				if inst[2] == '80h':
					address = address+2
					hexstr = 'CD80'
			elif inst[1] == 'mul':
				if inst[2] in regesterTable:
					hexstr = 'F7'+incReg('E0', inst[2])
					address = address+2
				else:
					hexstr = 'F725'
					address = address+6
					str1 = inst[2][6:]
					str1 = str1[:len(str1)-1]
					str1flag = 1
			elif inst[1] == 'div':
				if inst[2] in regesterTable:
					hexstr = 'F7'+incReg('F0', inst[2])
					address = address+2
				else:
					hexstr = 'F735'
					address = address+6
					str1 = inst[2][6:]
					str1 = str1[:len(str1)-1]
					str1flag = 1
			elif inst[4] in regesterTable: #opcode reg1, reg2
				pre = ''
				address += 2
				if inst[1] == 'mov':
					hexstr = '89'
				elif inst[1] == 'add':
					hexstr = '09'
				elif inst[1] == 'sub':
					hexstr = '29'
				elif inst[1] == 'cmp':
					hexstr = '39'

				#below line calculate MOD R/M
				index = regesterTable.index(inst[4])
				pre = pre+chr(67+int(index/2))
				pre = pre+str((index%2)*8)
				hexstr = hexstr+incReg(pre, inst[2])

			else: #opcode reg, imm/var/dword[]
				addrinc = 0
				byteinc = 4
				if inst[4].startswith('dword[') and inst[4].endswith(']'):
					address += 6
					addinc = 0
					byteinc = 4
					pre = ''
					if inst[2] == 'eax':
						pre = '05'
					elif inst[2] == 'ecx':
						pre = '0D'
					elif inst[2] == 'edx':
						pre = '15'
					elif inst[2] == 'ebx':
						pre = '1D'
					elif inst[2] == 'esp':
						pre = '25'
					elif inst[2] == 'ebp':
						pre = '2D'
					elif inst[2] == 'esi':
						pre = '35'
					elif inst[2] == 'edi':
						pre = '3D'

					str1 = inst[4][6:]
					str1 = str1[:len(str1)-1]
					str1flag = 1

					if inst[1] == 'mov' and inst[2] == 'eax':
						hexstr = 'A1'
						address -= 1
					elif inst[1] == 'mov':
						hexstr = '8B'+pre
					elif inst[1] == 'add':
						hexstr = '03'+pre
					elif inst[1] == 'sub':
						hexstr = '2B'+pre
					elif inst[1] == 'cmp':
						hexstr = '3B'+pre

				else:
					pre = ''
					byteinc = 1
					str1 = inst[4]
					str1flag = 1

					if inst[4].isdigit():
						addrinc = 1
					else:
						addrinc = 4
					if inst[4] in symbolTable:
						pre = '81'
					else:
						pre = '83'

					if inst[1] == 'mov':
						hexstr = incReg('B8', inst[2])
						byteinc = 4
						if inst[4].isdigit():
							address += 4
						else:
							address += 1
					elif inst[1] == 'add':
						hexstr = pre+incReg('C0', inst[2])
						address += 2
					elif inst[1] == 'sub':
						hexstr = pre+incReg('E8', inst[2])
						address += 2
					elif inst[1] == 'cmp':
						hexstr = pre+incReg('F8', inst[2])
						address += 2

			if str1flag == 1:
				if str1.isdigit():
					if int(str1) > 255 and byteinc == 1:
						byteinc = 4
						addrinc = 4
					hexstr = hexstr+integerIntoHex(str1, byteinc)
					address += addrinc
				else: #inst[4] is in symbolTable
					index = symbolTable.index(str1)
					hexstr1 = integerIntoHex(symbolTable[index+2], 4)
					hexstr = hexstr+'['+hexstr1+']'
					address += addrinc			

			finalHex.append(hexstr)
			instStr = splitFile[int(inst[0])-1]
			finalHex.append(instStr)


######################################################
print("\n")
str1 = ''
finalHex1 = []
for ind, ele in enumerate(finalHex):
	if ind%4 == 0:
		str1 = ''
		str1 = str1+' '*(8-len(str(finalHex[ind+0])))+str(finalHex[ind+0])+' '
		str1 = str1+' '*(8-len(finalHex[ind+1]))+finalHex[ind+1]+' '
		str1 = str1+finalHex[ind+2]+' '*(32-len(finalHex[ind+2]))+' '
		str1 = str1+finalHex[ind+3]
		finalHex1.append(str1)

for ele in finalHex1:
	finalHexFile.write(ele)
	finalHexFile.write('\n')
	print(ele)
######################################################



