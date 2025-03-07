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
            window.addEventListener('mousedown', this.globalPointerDownHandler);

        } else {
            if(this.check(pos.x,pos.y)){
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

    private globalPointerDownHandler = (e: MouseEvent) => {
        if (e.button !== 0) return; // Only handle left mouse button
      
        // Get the bounding rectangle of the stage container
        const stageContainer = this.konvaStage.container();
        const containerRect = stageContainer.getBoundingClientRect();
        console.log("Stage container bounding box:", containerRect);
        console.log("Mouse position:", e.clientX, e.clientY);
      
        if (
          e.clientX < containerRect.left ||
          e.clientX > containerRect.right ||
          e.clientY < containerRect.top ||
          e.clientY > containerRect.bottom
        ) {
          console.log("Clicked outside the stage (e.g., on the toolbar). Finalizing shape.");
          window.removeEventListener('mousedown', this.globalPointerDownHandler);
          this.finalShape();
          return;
        }
      
        // If inside the stage, call the mouseDownHandler with the original event attached
        this.mouseDownHandler({
          currentTarget: this.konvaStage,
          evt: e // Attach the native event so you can use e.evt.clientX inside mouseDownHandler if needed
        } as unknown as Konva.KonvaEventObject<MouseEvent>);
      };
      

    //to finalise the shape
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

    // to check if the point clicked is close to the start point by seeing the gap between the two points
    private check(x,y){
        if(!this.startPos) return false;
        const dx=x-this.startPos.x;
        const dy=y-this.startPos.y;

        return Math.sqrt(dx*dx+dy*dy)<=20;
    }
    
}
