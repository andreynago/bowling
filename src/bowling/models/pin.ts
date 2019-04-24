class Pin {
   /*
   0 0 0 0 [0,1,2,3]
    0 0 0  [4, 5, 6 ]
     0 0     [7, 8]
      0        [9]
    */

    private locationIdentifier: number;
    private isKnocked: boolean;

    get LocationIdentifier() {
        return this.locationIdentifier;
    }

    get IsKnocked() {
        return this.isKnocked;
    }

    set IsKnocked(isKnocked: boolean) {
        this.isKnocked = isKnocked;
    }

    constructor(id: number, isKnocked: boolean = false) {
        this.locationIdentifier = id;
        this.isKnocked = isKnocked;
    }
}

export default Pin;
