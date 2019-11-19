CC=g++
EXE_FILE=hunt_the_wumpus
INTERFACE=$(CPP_DIR)/hunt_the_wumpus
LIB_NAME=panels
BUILD_DIR=build
OUT_DIR=bin
CPP_DIR=src
HPP_DIR=include
LIB_DIR=lib
LIB_DIR_REL=../lib
LIB_HPP_DIR=lib/include

all: lib
.PHONY: clean

lib: server neural canvas

server:
	cd ./scripts/server && npm install
	cd ../..

neural:
	cd ./scripts/neural && npm install
	cd ../..

canvas:
	cd ./scripts/canvas && npm install
	cd ../..


#$(LIB_DIR)/lib$(LIB_NAME).so:
#	make -C $(LIB_DIR)

#$(BUILD_DIR):
#	mkdir $(BUILD_DIR)

#$(OUT_DIR):
#	mkdir $(OUT_DIR)

clean:
	rm -r -f ./scripts/server/node_modules ./scripts/neural/node_modules ./scripts/canvas/node_modules

