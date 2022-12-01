import { Position } from "../position.interface";

export interface TerminalChange {
    /** Position (in the pre-change coordinate system) where the change started. */
    from: Position;
    /** Position (in the pre-change coordinate system) where the change ended. */
    to: Position;
    /** Array of strings representing the text that replaced the changed range (split by line). */
    text: string[];
    /**  Text that used to be between from and to, which is overwritten by this change. */
    removed?: string[] | undefined;
    /**  String representing the origin of the change event and whether it can be merged with history */
    origin?: string | undefined;
}
