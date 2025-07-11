import { h } from "vue";
import { ElAlert } from "element-plus";


// 用户对话框配置
export const USER_CONFIG = {
  formItems: [
    {
      label: "用户名",
      prop: "username",
      type: "input",
      componentProps: {
        placeholder: "请输入用户名",
        slots: {
          append: () =>
            h(ElAlert, {
              title: "默认初始密码：123456",
              type: "success",
              closable: false,
              style: {
                lineHeight: "10px",
                marginTop: "8px",
                padding: "0 10px",
              },
            }),
        },
      },
    },
    {
      label: "邮箱",
      prop: "email",
      type: "input",
      componentProps: {
        placeholder: "请输入邮箱",
        type: "email",
      },
    },
    {
      label: "手机号",
      prop: "phonenumber",
      type: "input",
      componentProps: {
        placeholder: "请输入手机号",
        maxlength: 11,
      },
    },
    {
      label: "状态",
      prop: "status",
      type: "radio-group",
      options: [
        { label: "停用", value: 0 },
        { label: "正常", value: 1 },
      ],
    },
    {
      label: "备注",
      prop: "remark",
      type: "textarea",
      componentProps: {
        placeholder: "请输入备注",
        rows: 3,
      },
    },
  ],
  rules: {
    username: [
      { required: true, message: "用户名不能为空", trigger: "blur" },
      {
        min: 3,
        max: 100,
        message: "用户名长度在3到100个字符",
        trigger: "blur",
      },
    ],
    email: [
      { required: true, message: "邮箱不能为空", trigger: "blur" },
      { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" },
    ],
    phonenumber: [
      { required: true, message: "手机号不能为空", trigger: "blur" },
      {
        pattern: /^1[3-9]\d{9}$/,
        message: "请输入正确的手机号",
        trigger: "blur",
      },
    ],
    status: [{ required: true, message: "请选择状态", trigger: "change" }],
  },
};

// 角色对话框配置
export const ROLE_CONFIG = {
  formItems: [
    {
      label: "角色名称",
      prop: "name",
      type: "input",
      componentProps: {
        placeholder: "请输入角色名称",
        clearable: true,
      },
    },
    {
      label: "权限字符",
      prop: "code",
      type: "input",
      componentProps: {
        placeholder: "请输入权限字符（如：admin）",
        clearable: true,
      },
    },
    {
      label: "备注",
      prop: "remark",
      type: "textarea",
      componentProps: {
        placeholder: "请输入备注",
        rows: 3,
      },
    },
  ],
  rules: {
    name: [
      { required: true, message: "角色名称不能为空", trigger: "blur" },
      { min: 2, max: 50, message: "长度在2-50个字符", trigger: "blur" },
    ],
    code: [
      { required: true, message: "权限字符不能为空", trigger: "blur" },
      {
        pattern: /^[a-zA-Z0-9_]+$/,
        message: "只能包含字母、数字和下划线",
        trigger: "blur",
      },
    ],
  },
};

// 菜单对话框配置
export const MENU_CONFIG = {
  formItems: [
    {
      label: "上级菜单",
      prop: "parent",
      type: "select",
      componentProps: {
        placeholder: "请选择上级菜单",
        filterable: true,
        clearable: true,
      },
      options: []
    },
    {
      label: "菜单类型",
      prop: "menu_type",
      type: "radio-group",
      options: [
        { label: "目录", value: "M" },
        { label: "菜单", value: "C" }
      ]
    },
    {
      label: "菜单图标",
      prop: "icon",
      type: "input",
      componentProps: {
        placeholder: "输入Element图标组件名",
        maxlength: 50
      }
    },
    {
      label: "菜单名称",
      prop: "name",
      type: "input",
      componentProps: {
        placeholder: "请输入2-50个字符",
        maxlength: 50,
        showWordLimit: true
      }
    },
    {
      label: "权限标识",
      prop: "perms",
      type: "input",
      componentProps: {
        placeholder: "如：system:user:list"
      }
    },
    {
      label: "路由路径",
      prop: "path",
      type: "input",
      componentProps: {
        placeholder: "如：/system/user"
      }
    },
    {
      label: "组件路径",
      prop: "component",
      type: "input",
      componentProps: {
        placeholder: "如：system/user/index"
      }
    },
    {
      label: "显示顺序",
      prop: "order_num",
      type: "input-number",
      componentProps: {
        min: 1,
        max: 999
      }
    },
    {
      label: "备注",
      prop: "remark",
      type: "textarea",
      componentProps: {
        rows: 3,
        maxlength: 200,
        showWordLimit: true
      }
    }
  ],
  rules: {
    parent: [{ required: true, message: "请选择上级菜单", trigger: "change" }],
    menu_type: [{ required: true, message: "请选择菜单类型", trigger: "change" }],
    name: [
      { required: true, message: "菜单名称不能为空", trigger: "blur" },
      { min: 2, max: 50, message: "长度在2-50个字符", trigger: "blur" }
    ],
    path: [{ required: true, message: "路由路径不能为空", trigger: "blur" }]
  }
};
// dialogConfig.js
// 标签管理对话框配置
export const TAG_CONFIG = {
  formItems: [
    {
      label: "标签名称",
      prop: "tag_name",
      type: "input",
      componentProps: {
        placeholder: "请输入标签名称",
        clearable: true,
        maxlength: 50,
        showWordLimit: true
      }
    },
  ],
  rules: {
    tag_name: [
      { required: true, message: "标签名称不能为空", trigger: "blur" },
      { min: 2, max: 50, message: "长度在2-50个字符", trigger: "blur" }
    ]
  }
};

// 分类管理对话框配置
export const CATEGORY_CONFIG = {
  formItems: [
    {
      label: "分类名称",
      prop: "category_name",
      type: "input",
      componentProps: {
        placeholder: "请输入分类名称",
        clearable: true,
        maxlength: 50,
        showWordLimit: true
      }
    },
  ],
  rules: {
    category_name: [
      { required: true, message: "分类名称不能为空", trigger: "blur" },
      { min: 2, max: 50, message: "长度在2-50个字符", trigger: "blur" }
    ],
  }
};

export const ARTICLE_PUBLISH_CONFIG = {
  formItems: [
    {
      label: "文章标题",
      prop: "article_title",
      type: "input",
      componentProps: {
        disabled: true,
        placeholder: "文章标题",
        clearable: false
      }
    },
    {
      label: "文章封面",
      prop: "article_cover",
      type: "upload",
      componentProps: {
        showFileList: false,
        placeholder: "请上传文章封面图片",
      }
    },
    {
      label: "文章分类",
      prop: "category",
      type: "select",
      componentProps: {
        placeholder: "请选择分类",
        options: []
      }
    },
    {
      label: "文章标签",
      prop: "tags",
      type: "select",
      componentProps: {
        multiple: true,
        placeholder: "请选择标签",
        options: []
      }
    },
    {
      label: "文章摘要",
      prop: "article_description",
      type: "textarea",
      componentProps: {
        rows: 4,
        placeholder: "请输入文章摘要"
      }
    },
    {
      label: "文章类型",
      prop: "type",
      type: "radio-group",
      componentProps: {
        placeholder: "请选择类型",
        options: [
          { label: "原创", value: 1 },
          { label: "转载", value: 2 },
          { label: "翻译", value: 3 }
        ]
      }
    },
    {
      label: "置顶状态",
      prop: "is_top",
      type: "switch",
      componentProps: {
        activeValue: 1,
        inactiveValue: 2,
        activeText: "置顶",
        inactiveText: "普通"
      }
    },
    {
      label: "发布状态",
      prop: "status",
      type: "radio-group",
      options: [
        { label: "发布", value: 1 },
        { label: "私密", value: 2 },
        { label: "草稿", value: 3 }
      ]
    }
  ],
  rules: {
    category: [
      { required: true, message: '请选择文章分类', trigger: 'change' }
    ],
    tags: [{ required: true, message: '请选择文章标签', trigger: 'change' }],
    article_description: [{ required: true, message: '请输入文章摘要', trigger: 'blur' }],
  }
};

export const ALBUM_CONFIG = {
  // 表单项配置
  formItems: [
    {
      label: '相册名',
      prop: 'album_name',
      type: 'input',
      componentProps: {
        placeholder: '请输入相册标题'
      }
    },
    {
      label: '封面',
      prop: 'album_cover',
      type: 'upload',
    },
    {
      label: '描述',
      prop: 'description',
      type: 'textarea',
      componentProps: {
        placeholder: '请输入相册描述',
        rows: 4
      }
    }
  ],

  // 表单验证规则
  rules: {
    album_name: [{ required: true, message: '请输入相册标题', trigger: 'blur' }],
    album_cover: [{ required: true, message: '请选择封面图片', trigger: 'change' }],
    description: [{ required: true, message: '请输入相册描述', trigger: 'blur' }]
  }
};