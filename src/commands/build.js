const questions = require('../lib/buildQuestions');
const Booklet = require('../lib/Booklet');

module.exports = {
    name: 'build',
    alias: ['b'],
    help: 'build src_filepath',
    run: async (toolbox) => {
        const srcFilename = toolbox.parameters.first;
        const destFilename = srcFilename.replace(".pdf", "-booklet.pdf");

        const answers = await toolbox.prompt.ask(questions);

        const bk = new Booklet(srcFilename, destFilename);
        await bk.init();

        if (answers.hasCover) await bk.saveCover(srcFilename.replace(".pdf", "-cover.pdf"));

        await bk.removePages(answers.removePages);

        await bk.cropInches(
            parseFloat(answers.cropTop),
            parseFloat(answers.cropRight),
            parseFloat(answers.cropBottom),
            parseFloat(answers.cropLeft)
        );

        bk.setMarginsInches(
            parseFloat(answers.marginTop),
            parseFloat(answers.marginBottom),
            parseFloat(answers.marginOutside),
            parseFloat(answers.marginInside)
        );

        await bk.create();
        await bk.save();
    },
};
