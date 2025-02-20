import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { AnnotationType } from '../../const/definitions';
import { Editor, IEditorOptions } from './editor';

export class EditorPolygon extends Editor {
    private polygon: Konva.Line;
    private points: number[] = [];
    private isDrawing = false;
    private startPos:{x:number,y:number} | null = null;

    constructor(EditorOptions: IEditorOptions) {
        super({ ...EditorOptions, editorType: AnnotationType.POLYGON });
    }

    protected mouseDownHandler(e: KonvaEventObject<MouseEvent | TouchEvent>): void {
        if (e.currentTarget !== this.konvaStage) return;

        const pos = this.konvaStage.getRelativePointerPosition();

        if (!this.isDrawing) {
            this.isDrawing = true;
            this.points = [pos.x, pos.y];
            this.startPos = {x:pos.x,y:pos.y};

            this.currentShapeGroup = this.createShapeGroup();
            this.getBgLayer().add(this.currentShapeGroup.konvaGroup);

            this.polygon = new Konva.Line({
                points: this.points,
                stroke: this.currentAnnotation.style.color || 'red',
                strokeWidth: this.currentAnnotation.style.strokeWidth || 3,
                opacity: this.currentAnnotation.style.opacity || 1,
                lineJoin: 'round',
                closed: false, // Initially open
                visible: true
            });

            this.currentShapeGroup.konvaGroup.add(this.polygon);
        } else {
            if(this.check(pos.x,pos.y)){
                // pos.x=this.startPos.x
                // pos.y=this.startPos.y
                // this.points.push(pos.x,pos.y)
                this.polygon.points(this.points)
                this.finalShape();
                return ;
            }
            this.points.push(pos.x, pos.y);
            this.polygon.points(this.points);
            this.polygon.getLayer().batchDraw();
        }
    }

    protected mouseMoveHandler(e: KonvaEventObject<MouseEvent | TouchEvent>) {
        if (!this.isDrawing || this.points.length < 2) return;

        const pos = this.konvaStage.getRelativePointerPosition();
        const tempPoints = [...this.points, pos.x, pos.y];

        this.polygon.points(tempPoints);
        this.polygon.getLayer().batchDraw();
    }

    protected mouseUpHandler() {
        // No need to finalize here since we add vertices on click
    }
    
    private finalShape(){
        if(!this.isDrawing || this.points.length < 6) return;

        this.isDrawing=false;
        this.polygon.closed(true);
        this.polygon.getLayer().batchDraw();

        this.setShapeGroupDone({
            id:this.currentShapeGroup.id,
            color:this.currentAnnotation.style.color,
            contentsObj:{text:''},
        })

    }

    private check(x,y){
        if(!this.startPos) return false;
        const dx=x-this.startPos.x;
        const dy=y-this.startPos.y;

        return Math.sqrt(dx*dx+dy*dy)<=20;
    }
    
    // private handleDoubleClick = () => {
    //     this.finalShape();
    // };

    // protected attachEventListeners() {
    //     this.konvaStage.on('dblclick', this.handleDoubleClick);
    // }

    // protected detachEventListeners() {
    //     this.konvaStage.off('dblclick', this.handleDoubletClick);
}
