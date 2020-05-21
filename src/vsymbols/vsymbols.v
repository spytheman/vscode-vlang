module main

import v.pref
import v.parser
import v.ast
import v.table
import v.token
import v.util
import os
import json
import crypto.md5

const (
	our_temp_dir = os.join_path(os.temp_dir(), 'vsymbols')
	invalid_input_message = 'Failed to parse json, Please make sure that the input is a JSON string'
)

struct Context {
mut:
	file	File
}

struct File {
mut:
	temp_path		string
	path			string
	module_name		string
	symbols			[]SymbolInfo
}

struct SymbolInfo {
	name		string
	pos			Position
	real_pos	token.Position
	kind		string
}

struct Position {
	line	int
	column	int
}

struct Input {
	filepath	string
	source		string
}

fn main() {
	args := os.args[1..]
	debug := '-debug' in args

	stdin := os.get_lines_joined()
	input := json.decode(Input, stdin) or { eprintln(invalid_input_message) }

	// Create temp dir if not exist
	if !os.exists(our_temp_dir) {
		os.mkdir(our_temp_dir) or { panic(err) }
	}
	
	filename := create_temp_file(input.filepath, input.source)
	
	fscope := ast.Scope{ parent: 0 }
	prefs := pref.Preferences{}
	table := table.new_table()

	mut ctx := Context{
		file: File{ 
			path: input.filepath 
			temp_path: filename 
		}
	}
	
	parse_result := parser.parse_file(filename, table, .skip_comments, prefs, fscope)
	for stmt in parse_result.stmts {
		match stmt {
			ast.Module {
				amodule := stmt as ast.Module
				ctx.file.module_name = amodule.name
				continue
			}
			ast.FnDecl {
				fn_decl := stmt as ast.FnDecl 
				if fn_decl.is_method {
					ctx.file.process_method(fn_decl) 
				} else {
					ctx.file.process_fn(fn_decl) 
				}
			}
			ast.StructDecl { 
				ctx.file.process_struct(stmt) 
			}
			ast.ConstDecl { 
				ctx.file.process_const(stmt) 
			}
			else { continue }
		}
	}

	println(json.encode(ctx.file))
	
	if debug {
		for symbol in ctx.file.symbols {
			println(symbol)
		}
	}
}

/* --------------------------------- STRUCT --------------------------------- */
fn (mut file File) process_struct(stmt ast.Stmt) {
	struct_decl := stmt as ast.StructDecl
	file.symbols << SymbolInfo{
		name: get_real_name(struct_decl.name)
		pos: get_real_position(file.temp_path, struct_decl.pos)
		real_pos: struct_decl.pos
		kind: 'struct'
	}
}

/* --------------------------------- CONST --------------------------------- */
fn (mut file File) process_const(stmt ast.Stmt) {
	const_decl := stmt as ast.ConstDecl
	for const_field in const_decl.fields {
		file.symbols << SymbolInfo{
			name: get_real_name(const_field.name)
			pos: get_real_position(file.temp_path, const_field.pos)
			real_pos: const_decl.pos
			kind: 'const'
		}
	}
}

/* -------------------------------- FUNCTION -------------------------------- */
fn (mut file File) process_fn(fn_decl ast.FnDecl) {
	file.symbols << SymbolInfo{
		name: get_real_name(fn_decl.name)
		pos: get_real_position(file.temp_path, fn_decl.pos)
		real_pos: fn_decl.pos
		kind: 'function'
	}
}

/* -------------------------------- METHOD -------------------------------- */
fn (mut file File) process_method(fn_decl ast.FnDecl) {
	file.symbols << SymbolInfo{
		name: get_real_name(fn_decl.name)
		pos: get_real_position(file.temp_path, fn_decl.pos)
		real_pos: fn_decl.pos
		kind: 'method'
	}
}

/* ---------------------------------- UTILS --------------------------------- */
fn get_real_position(filepath string, pos token.Position) Position {
	source := util.read_file(filepath) or { '' }
	mut p := imax(0, imin(source.len - 1, pos.pos))
	if source.len > 0 {
		for ; p >= 0; p-- {
			if source[p] == `\r` || source[p] == `\n` {
				break
			}
		}
	}
	column := imax(0, pos.pos - p - 1)
	return Position { 
		line: pos.line_nr + 1
		column: imax(1, column + 1) 
	}	
}


fn get_real_name(name string) string {
	name_split := name.split('.')
	if name_split.len > 1 { 
		return name_split[name_split.len - 1] 
	}
	return name
}

fn create_temp_file(filename, content string) string {
	if content.len < 3 { return filename }
	hashed_name := md5.sum(filename.bytes()).hex()
	target := os.join_path(our_temp_dir, hashed_name)
	os.write_file(target, content)
	return target
}

[inline]
fn imin(a, b int) int {
	return if a < b { a } else { b }
}

[inline]
fn imax(a, b int) int {
	return if a > b { a } else { b }
}
