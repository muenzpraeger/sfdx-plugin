import { SfdxCommand } from '@salesforce/command';
export default class SourceCleanupAura extends SfdxCommand {
    static description: string;
    static controller: string;
    static css: string;
    static helper: string;
    static design: string;
    static auradoc: string;
    static renderer: string;
    static svg: string;
    static examples: string[];
    protected static flagsConfig: {
        help: {
            name: string;
            char?: "A" | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "x" | "y" | "z" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "X" | "Y" | "Z";
            description?: string;
            hidden?: boolean;
            required?: boolean;
            dependsOn?: string[];
            exclusive?: string[];
            env?: string;
            parse(input: boolean, context: any): void;
        } & {
            type: "boolean";
            allowNo: boolean;
        };
        noprompt: {
            name: string;
            char?: "A" | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "x" | "y" | "z" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "X" | "Y" | "Z";
            description?: string;
            hidden?: boolean;
            required?: boolean;
            dependsOn?: string[];
            exclusive?: string[];
            env?: string;
            parse(input: boolean, context: any): boolean;
        } & {
            type: "boolean";
            allowNo: boolean;
        };
    };
    protected static requiresProject: boolean;
    isAuraFile(file: string): boolean;
    isAuraStandardContent(fileContent: string): boolean;
    run(): Promise<any>;
}
