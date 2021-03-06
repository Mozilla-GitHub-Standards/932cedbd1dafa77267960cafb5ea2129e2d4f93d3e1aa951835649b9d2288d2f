#!/usr/local/bin/python

'''
Manages our crontabs.
'''
#TODO(rrayborn): figure out why it's adding whitespace to the crontab

__author__     = 'Rob Rayborn'
__copyright__  = 'Copyright 2014, The Mozilla Foundation'
__license__    = 'MPLv2'
__maintainer__ = 'Rob Rayborn'
__email__      = 'rrayborn@mozilla.com'
__status__     = 'Production'

import os
from crontab import CronTab

_WRAPPER_PATH = '$CODE_PATH/pipelines/cron/backend_wrapper.sh'
_LOG_PATH     = '/tmp/logs/'

#TODO(rrayborn): this might need a csv or even a front end later
_JOBLIST = [
        #[cron_time_fmt, command, log_filename, UNIQUE tag that must not be changed]
        #[,,],
        ['0 3 * * *',
            'python $CODE_PATH/pipelines/google_play/pipeline.py',
            'google_play_cron',
            'Play Pipeline'],
        ['0 4 * * *',
            'python $CODE_PATH/pipelines/stats_pipeline/pipeline.py',
            'stats_cron',
            'Stats Pipeline'],
        ['0 5 * * *',
            'python $CODE_PATH/pipelines/hello_pipeline/pipeline.py',
            'hello_cron',
            'Hello Pipeline'],
        ['10 * * * *',
            'python $CODE_PATH/pipelines/alert_pipeline/pull_input_alert.py',
            'alert_pipe_cron',
            'Fetch alerts'],
        ['0 */6 * * *',
            'python $CODE_PATH/pipelines/alert_pipeline/word_alert.py --product desktop -v',
            'desktop_alert_cron',
            'Alert Pipeline'],
        ['0 6 * * *',
            'python $CODE_PATH/pipelines/alert_pipeline/word_alert.py --product android -v',
            'android_alert_cron',
            'Android Alert Pipeline']
    ]


#TODO(rrayborn): this might need a csv or even a front end later
_IGNORELIST = [
            #tags
        ]


def update_cron(user = None):
    """
    Updates the user's crontab

    Args:
        user (string): The word that needs stemming (default = $USER)

    Examples:
        >>> update_cron("rrayborn")
    """
    if not user:
        if os.environ['USER']:
            user = os.environ['USER']
        else:
            raise Exception('$USER not populated or overridden.')
    if not os.environ['CODE_PATH']:
        raise Exception('$CODE_PATH not populated. \
                        You should use the uabackend virtualenv.')

    cron = CronTab(user=user)

    invalid_jobs = []

    # Create/Replace jobs
    for entry in _JOBLIST:
        time     = entry[0]
        log_stmt = ' >' + _LOG_PATH + entry[2] + ' 2>&1 '
        command  = (_WRAPPER_PATH + ' ' + entry[1] + log_stmt)
        command  = command.replace('$CODE_PATH', os.environ['CODE_PATH'])
        tag      = entry[3]
        auto_tag = 'AUTOGENERATE: ' + tag

        # find existing jobs
        existing_jobs = cron.find_comment(auto_tag)
        is_empty = True

        # remove old jobs
        for job in existing_jobs:
            cron.remove(job)
            is_empty = False

        # print operation
        if is_empty:
            print 'Creating job with tag: "%s"' % str(tag)
        else:
            print 'Replacing job(s) with tag: "%s"' % str(tag)

        # create new jobs
        job = cron.new(command=command)
        job.setall(time)
        job.set_comment(auto_tag)

        # check validity
        if not job.is_valid(): #TODO(rrayborn): this never seems to be false.
            invalid_jobs.append(job)

    # Update ignored jobs
    for tag in _IGNORELIST:
        auto_tag = 'AUTOGENERATE: ' + tag
        for job in cron.find_comment(auto_tag):
            print 'Ignoring job: "%s"' % str(tag)
            job.enable(False)

    if invalid_jobs:
        raise Exception('The following jobs are invalid:\n%s' % \
                        '\n'.join(invalid_jobs))

    cron.write()


if __name__ == '__main__':
    update_cron()
