import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { AnnotationType } from '../../const/definitions';
import { Editor, IEditorOptions } from './editor';

export class EditorTriangle extends Editor {
    private line: Konva.Line;
    private points: number[] = [];
    private startPos: { x: number; y: number } | null = null;

    constructor(EditorOptions: IEditorOptions) {
        super({ ...EditorOptions, editorType: AnnotationType.TRIANGLE });
    }

    protected mouseDownHandler(e: KonvaEventObject<MouseEvent | TouchEvent>): void {
        if (e.currentTarget !== this.konvaStage) return;

        this.isPainting = true;
        this.startPos = this.konvaStage.getRelativePointerPosition();

        this.currentShapeGroup = this.createShapeGroup();
        this.getBgLayer().add(this.currentShapeGroup.konvaGroup);

        this.line = new Konva.Line({
            points: [],
            stroke: this.currentAnnotation.style.color || 'red',
            strokeWidth: this.currentAnnotation.style.strokeWidth || 3,
            opacity: this.currentAnnotation.style.opacity || 1,
            lineCap: 'round',
            closed: true,
            lineJoin: 'round',
            visible: true
        });

        this.currentShapeGroup.konvaGroup.add(this.line);
        window.addEventListener('mouseup', this.globalPointerUpHandler);
    }

    protected mouseMoveHandler(e: KonvaEventObject<MouseEvent | TouchEvent>) {
        if (!this.isPainting || !this.startPos) return;

        const pos = this.konvaStage.getRelativePointerPosition();
        this.generateTriangle(this.startPos, pos);

        this.line.points(this.points);
        this.line.getLayer().batchDraw();
        //
    }

    protected mouseUpHandler() {
        if (!this.isPainting) return;

        this.isPainting = false;
        this.startPos = null;
        this.line.show();

        this.setShapeGroupDone({
            id: this.currentShapeGroup.id,
            color: this.currentAnnotation.style.color,
            contentsObj: { text: '' },
        });
    }

    private generateTriangle(start, end) {
        this.points = [];
        const size = Math.abs(end.x - start.x);
        const height = (Math.sqrt(3) / 2) * size;

        const v1 = { x: start.x, y: start.y };
        const v2 = { x: start.x - size / 2, y: start.y + height };
        const v3 = { x: start.x + size / 2, y: start.y + height };

        this.points.push(v1.x, v1.y, v2.x, v2.y, v3.x, v3.y);
    }

   

    private globalPointerUpHandler = (e: MouseEvent) => {
        if (e.button !== 0) return;
        this.mouseUpHandler();
        window.removeEventListener('mouseup', this.globalPointerUpHandler);
    };
}
