const { PDFDocument, PageSizes, degrees, rgb } = require('pdf-lib');
const fs = require('fs/promises');

function Booklet(srcFilename, destFilename) {
    this.srcFilename = srcFilename;
    this.destFilename = destFilename;
    this.bookletPdf = null;
    this.srcPdf = null;
    this.srcPdfPageCount = 0;
    this.removedPages = [];
    this.bookletNum = 0;
    this.hasCover = false;
    this.dpi = 72;
    this.margins = { top: 0, bottom: 0, outside: 0, inside: 0 };
}

Booklet.prototype.init = async function () {
    this.bookletPdf = await PDFDocument.create();
    this.srcPdf = await PDFDocument.load(await fs.readFile(this.srcFilename));
    this.srcPdfPageCount = this.srcPdf.getPageCount();
};

Booklet.prototype.crop = async function (top, right, bottom, left) {
    const croppedPdf = await PDFDocument.create();

    for (const pageIndex of this.srcPdf.getPageIndices()) {
        const page = croppedPdf.addPage(PageSizes.A5);
        const srcPage = this.srcPdf.getPage(pageIndex);

        const croppedPage = await croppedPdf.embedPage(
            srcPage, {
            left: 0 + left,
            bottom: 0 + bottom,
            right: srcPage.getSize().width - right,
            top: srcPage.getSize().height - top,
        });

        page.drawPage(croppedPage, {
            width: PageSizes.A5[0],
            height: PageSizes.A5[1],
            x: 0,
            y: 0,
        });
    }

    this.srcPdf = await PDFDocument.load(await croppedPdf.save());
};

Booklet.prototype.cropInches = function (top, right, bottom, left) {
    return this.crop(top * this.dpi, right * this.dpi, bottom * this.dpi, left * this.dpi);
};

Booklet.prototype.save = async function () {
    const dataBytes = await this.bookletPdf.save();
    fs.writeFile(this.destFilename, dataBytes, "utf8", (err, data) => {
        if (err) throw new Error(`Couldn't save file: ${err.message}`);
    });
};

Booklet.prototype.saveCover = async function (filename) {
    const coverPdf = await PDFDocument.create();
    const page = coverPdf.addPage(PageSizes.A5);

    const [cover] = await coverPdf.embedPdf(this.srcPdf, [0]);

    page.drawPage(cover, {
        width: PageSizes.A5[0],
        height: PageSizes.A5[1],
        x: 0,
        y: 0,
    });

    const dataBytes = await coverPdf.save();
    fs.writeFile(filename, dataBytes, "utf8", (err, data) => {
        if (err) throw new Error(`Couldn't save file: ${err.message}`);
    });

    this.hasCover = true;
};

Booklet.prototype.removePages = async function (removePagesStr) {
    const pagesToRemove = (removePagesStr === "") ? [] : removePagesStr.replace(/\s/g, '').split(',');
    if (this.hasCover) pagesToRemove.unshift("1");

    for (const page of pagesToRemove) {
        const range = page.split('-');
        if (range.length === 2) {
            for (let i = parseInt(range[0]); i <= parseInt(range[1]); i++) this.removedPages.push(i - 1 - this.removedPages.length);
        } else this.removedPages.push(parseInt(page) - 1 - this.removedPages.length);
    }

    if (this.removePages.length) {
        this.removedPages.forEach((index) => this.srcPdf.removePage(index));
        this.srcPdfPageCount = this.srcPdf.getPageCount();
        this.srcPdf = await PDFDocument.load(await this.srcPdf.save());
    }
};


Booklet.prototype._addBookletPage = async function (leftIndex, rightIndex, rotate = false) {
    const pageA4 = this.bookletPdf.addPage(PageSizes.A4);
    pageA4.setRotation(degrees(90)); // landscape orientation
    const options = {
        width: (pageA4.getHeight() / 2) - (this.margins.inside + this.margins.outside),
        height: pageA4.getWidth() - (this.margins.top + this.margins.bottom),
    };

    if (leftIndex !== null) {
        const [pageLeft] = await this.bookletPdf.embedPdf(this.srcPdf, [leftIndex]);

        if (rotate) {
            options.x = this.margins.bottom;
            options.y = pageA4.getHeight() / 2 - this.margins.inside;
            options.rotate = degrees(270);
        } else {
            options.x = pageA4.getWidth() - this.margins.bottom;
            options.y = this.margins.outside;
            options.rotate = degrees(90);
        }
        pageA4.drawPage(pageLeft, options);
    }

    if (rightIndex !== null) {
        const [pageRight] = await this.bookletPdf.embedPdf(this.srcPdf, [rightIndex]);

        if (rotate) {
            options.x = this.margins.top;
            options.y = pageA4.getHeight() - this.margins.outside;
            options.rotate = degrees(270);
        } else {
            options.x = pageA4.getWidth() - this.margins.bottom;
            options.y = pageA4.getHeight() / 2 + this.margins.inside;
            options.rotate = degrees(90);
        }
        pageA4.drawPage(pageRight, options);
    }

    pageA4.drawLine({
        start: { x: 0, y: pageA4.getHeight() / 2 },
        end: { x: pageA4.getWidth(), y: pageA4.getHeight() / 2 },
        thickness: 2,
        color: rgb(0.48, 0.48, 0.48),
        opacity: 1,
    });
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

Booklet.prototype.setMarginsInches = function (top, bottom, outside, inside) {
    this.margins = {
        top: top * this.dpi,
        bottom: bottom * this.dpi,
        outside: outside * this.dpi,
        inside: inside * this.dpi
    };

    return this.margins;
};

module.exports = Booklet;