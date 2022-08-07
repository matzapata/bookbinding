const { PDFDocument, PageSizes, degrees } = require('pdf-lib');
const fs = require('fs/promises');

function Booklet(srcFilename, destFilename) {
    this.srcFilename = srcFilename;
    this.destFilename = destFilename;
    this.bookletPdf = null;
    this.srcPdf = null;
    this.srcPdfPageCount = 0;
    this.removedPages = [];
    this.bookletNum = 0;
}

Booklet.prototype.init = async function () {
    this.bookletPdf = await PDFDocument.create();
    this.srcPdf = await PDFDocument.load(await fs.readFile(this.srcFilename));
    this.srcPdfPageCount = this.srcPdf.getPageCount();
};


Booklet.prototype.save = async function () {
    const dataBytes = await this.bookletPdf.save();
    fs.writeFile(this.destFilename, dataBytes, "utf8", (err, data) => {
        if (err) throw new Error(`Couldn't save file: ${err.message}`);
    });
};

Booklet.prototype.removePages = async function (removePagesStr) {
    const pages = removePagesStr.replace(/\s/g, '').split(',');

    for (const page of pages) {
        const range = page.split('-');
        if (range.length === 2) {
            for (let i = parseInt(range[0]); i <= parseInt(range[1]); i++) this.removedPages.push(i - 1 - this.removedPages.length);
        } else this.removedPages.push(parseInt(page) - 1 - this.removedPages.length);
    }

    this.removedPages.forEach((index) => this.srcPdf.removePage(index));
    this.srcPdfPageCount = this.srcPdf.getPageCount();

    this.srcPdf = await PDFDocument.load(await this.srcPdf.save());
};


Booklet.prototype._addBookletPage = async function (leftIndex, rightIndex, rotate = false) {
    const page = this.bookletPdf.addPage(PageSizes.A4);
    page.setRotation(degrees(90)); // landscape orientation
    const options = {
        width: PageSizes.A4[1] / 2,
        height: PageSizes.A4[0],
    };

    if (leftIndex !== null) {
        const [pageLeft] = await this.bookletPdf.embedPdf(this.srcPdf, [leftIndex]);

        if (rotate) {
            options.x = 0
            options.y = PageSizes.A4[1] / 2
            options.rotate = degrees(270)
        } else  {
            options.x = PageSizes.A4[0]
            options.y = 0
            options.rotate = degrees(90)
        }
        page.drawPage(pageLeft, options);
    }

    if (rightIndex !== null) {
        const [pageRight] = await this.bookletPdf.embedPdf(this.srcPdf, [rightIndex]);

        if (rotate) {
            options.x = 0
            options.y = PageSizes.A4[1]
            options.rotate = degrees(270)
        } else  {
            options.x = PageSizes.A4[0]
            options.y = PageSizes.A4[1] / 2
            options.rotate = degrees(90)
        }
        page.drawPage(pageRight, options);
    }

};


Booklet.prototype._getNextPaginationPage = function () {
    if (this.bookletNum * 4 > this.srcPdfPageCount) return null;

    const basePage = this.bookletNum * 4;
    const pagination = [[basePage + 3, basePage], [basePage + 2, basePage + 1]];

    if (pagination[0][0] > this.srcPdfPageCount - 1) pagination[0][0] = null;
    if (pagination[0][1] > this.srcPdfPageCount - 1) pagination[0][1] = null;
    if (pagination[1][0] > this.srcPdfPageCount - 1) pagination[1][0] = null;
    if (pagination[1][1] > this.srcPdfPageCount - 1) pagination[1][1] = null;

    this.bookletNum++;

    return pagination;
};

Booklet.prototype.create = async function () {
    let pagination = this._getNextPaginationPage();
    while (pagination) {
        await this._addBookletPage(pagination[0][0], pagination[0][1]);
        await this._addBookletPage(pagination[1][0], pagination[1][1], true);
        pagination = this._getNextPaginationPage();
    }
};


module.exports = Booklet;