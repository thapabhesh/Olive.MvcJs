import Alert from 'olive/components/alert';
import Select from 'olive/plugins/select';
import Waiting from 'olive/components/waiting';
import { ModalHelper } from '../components/modal';
import AjaxRedirect from 'olive/mvc/ajaxRedirect';
import Form from 'olive/components/form';
import FormAction from './formAction';
export default class StandardAction implements IService {
    private alert;
    private form;
    private formAction;
    private waiting;
    private ajaxRedirect;
    private select;
    private modalHelper;
    constructor(alert: Alert, form: Form, formAction: FormAction, waiting: Waiting, ajaxRedirect: AjaxRedirect, select: Select, modalHelper: ModalHelper);
    enableLinkModal(selector: JQuery): void;
    runStartup(container?: JQuery, trigger?: any, stage?: string): void;
    runAll(actions: any, trigger?: any): void;
    private run;
    private notify;
    private redirect;
    private openModal;
    private openModaliFrame;
}
