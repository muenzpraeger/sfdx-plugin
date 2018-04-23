import { flags } from '@oclif/command';
import { SfdxCommand } from '@salesforce/command';
export default class Import extends SfdxCommand {
    static description: string;
    static examples: string[];
    protected static flagsConfig: {
        help: {
            name: string;
            char?: "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "x" | "y" | "z" | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "X" | "Y" | "Z";
            description?: string;
            hidden?: boolean;
            required?: boolean;
            dependsOn?: string[];
            env?: string;
            parse(input: boolean, context: any): void;
        } & {
            type: "boolean";
            allowNo: boolean;
        };
        path: flags.IOptionFlag<string>;
        outputdir: flags.IOptionFlag<string>;
        apiversion: flags.IOptionFlag<string>;
        classprefix: flags.IOptionFlag<string>;
        force: {
            name: string;
            char?: "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "x" | "y" | "z" | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "X" | "Y" | "Z";
            description?: string;
            hidden?: boolean;
            required?: boolean;
            dependsOn?: string[];
            env?: string;
            parse(input: boolean, context: any): boolean;
        } & {
            type: "boolean";
            allowNo: boolean;
        };
    };
    protected static supportsDevhubUsername: boolean;
    run(): Promise<any>;
}
