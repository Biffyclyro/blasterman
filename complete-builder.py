import os

option = int(input('Build option: dev=1, prod=2 \n'))

if option == 1:
    os.system('npm --prefix ./blasterman-api/ run build:dev && npm --prefix ./blasterman-client/ run build:dev')
elif option == 2:
    os.system('npm --prefix ./blasterman-api/ run buld:prod && npm --prefix ./blasterman-client/ run build:prod')
else:
    print('wrong option')